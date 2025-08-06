import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class S3Service {
    private s3Client: S3Client;
    private bucketName: string;
    private region: string;

    // Set para búsqueda O(1) en lugar de Array O(n)
    private readonly allowedMimeTypes = new Set([
        // Imágenes
        'image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp', 'image/bmp', 'image/svg+xml',
        // Documentos
        'application/pdf', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain', 'text/csv',
        // Videos
        'video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/webm',
        // Audio
        'audio/mpeg', 'audio/wav', 'audio/ogg',
        // Archivos comprimidos
        'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'
    ]);

    // Maps para categorización eficiente
    private readonly cacheControlMap = new Map([
        ['image/', 'max-age=31536000'],     // 1 año para imágenes
        ['application/pdf', 'max-age=86400'], // 1 día para PDFs
        ['video/', 'max-age=604800'],       // 1 semana para videos
        ['default', 'max-age=3600']         // 1 hora por defecto
    ]);

    private readonly categoryMap = new Map([
        ['image/', 'image'],
        ['video/', 'video'],
        ['audio/', 'audio'],
        ['application/pdf', 'pdf'],
        ['document', 'office'],
        ['sheet', 'office'],
        ['presentation', 'office'],
        ['zip', 'archive'],
        ['rar', 'archive'],
        ['7z', 'archive']
    ]);

    constructor(private configService: ConfigService) {
        this.initializeS3Config();
    }

    private initializeS3Config(): void {
        const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
        const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY');
        const bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME');
        this.region = this.configService.get<string>('AWS_REGION') || 'us-east-2';

        if (!accessKeyId || !secretAccessKey || !bucketName) {
            throw new Error('AWS credentials and bucket name must be configured');
        }

        this.s3Client = new S3Client({
            region: this.region,
            credentials: { accessKeyId, secretAccessKey },
        });

        this.bucketName = bucketName;
    }

    async uploadFile(
        file: Express.Multer.File,
        folder?: string,
        allowedTypes?: string[],
        maxSizeMB: number = 50
    ): Promise<string> {
        try {
            this.validateFile(file, allowedTypes, maxSizeMB);

            const fileExtension = this.getFileExtension(file.originalname);
            const fileName = `${uuidv4()}.${fileExtension}`;
            const key = folder ? `${folder}/${fileName}` : fileName;

            const command = new PutObjectCommand({
                Bucket: this.bucketName,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
                ContentDisposition: 'inline',
                CacheControl: this.getCacheControl(file.mimetype),
                Metadata: {
                    originalName: file.originalname,
                    uploadDate: new Date().toISOString(),
                    fileType: this.getFileCategory(file.mimetype),
                },
            });

            await this.s3Client.send(command);
            return this.buildS3Url(key);
        } catch (error) {
            return this.handleError(error, 'Error al subir el archivo');
        }
    }

    private validateFile(file: Express.Multer.File, allowedTypes?: string[], maxSizeMB: number = 50): void {
        if (!file) {
            throw new BadRequestException('No se proporcionó ningún archivo');
        }

        // Usar Set personalizado o el por defecto para validación O(1)
        const typesToValidate = allowedTypes ? new Set(allowedTypes) : this.allowedMimeTypes;

        if (!typesToValidate.has(file.mimetype)) {
            throw new BadRequestException(`Tipo de archivo no permitido: ${file.mimetype}`);
        }

        const maxSize = maxSizeMB * 1024 * 1024;
        if (file.size > maxSize) {
            throw new BadRequestException(`El archivo es demasiado grande. Máximo ${maxSizeMB}MB`);
        }
    }

    private getFileExtension(filename: string): string {
        return filename.split('.').pop() || '';
    }

    private buildS3Url(key: string): string {
        return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
    }

    async deleteFile(fileUrl: string): Promise<void> {
        try {
            const key = this.extractKeyFromUrl(fileUrl);
            if (!key) {
                throw new BadRequestException('URL de archivo inválida');
            }

            const command = new DeleteObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });

            await this.s3Client.send(command);
        } catch (error) {
            this.handleError(error, 'Error al eliminar el archivo');
        }
    }

    async getSignedUrl(fileUrl: string, expiresIn: number = 3600): Promise<string> {
        try {
            const key = this.extractKeyFromUrl(fileUrl);
            if (!key) {
                throw new BadRequestException('URL de archivo inválida');
            }

            const command = new GetObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });

            return await getSignedUrl(this.s3Client, command, { expiresIn });
        } catch (error) {
            return this.handleError(error, 'Error al generar URL de acceso');
        }
    }

    private handleError(error: any, message: string): never {
        if (error instanceof BadRequestException) {
            throw error;
        }
        console.error(message, error);
        throw new InternalServerErrorException(message);
    }

    private extractKeyFromUrl(url: string): string | null {
        try {
            const urlObj = new URL(url);
            return urlObj.pathname.substring(1);
        } catch {
            return null;
        }
    }

    private getCacheControl(mimetype: string): string {
        // Búsqueda optimizada con Map
        for (const [key, value] of this.cacheControlMap) {
            if (key === mimetype || mimetype.startsWith(key)) {
                return value;
            }
        }
        return this.cacheControlMap.get('default')!;
    }

    private getFileCategory(mimetype: string): string {
        // Verificar coincidencia exacta primero
        if (this.categoryMap.has(mimetype)) {
            return this.categoryMap.get(mimetype)!;
        }

        // Verificar por prefijo
        for (const [key, value] of this.categoryMap) {
            if (key.endsWith('/') && mimetype.startsWith(key)) {
                return value;
            }
            if (mimetype.includes(key)) {
                return value;
            }
        }

        return 'document';
    }

    /**
     * Valida si la configuración de AWS está correcta
     * @returns true si está configurado correctamente
     */
    isConfigured(): boolean {
        return !!(
            this.configService.get<string>('AWS_ACCESS_KEY_ID') &&
            this.configService.get<string>('AWS_SECRET_ACCESS_KEY') &&
            this.configService.get<string>('AWS_S3_BUCKET_NAME')
        );
    }
}
