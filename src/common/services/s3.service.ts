import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class S3Service {
    private s3Client: S3Client;
    private bucketName: string;

    constructor(private configService: ConfigService) {
        const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
        const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY');
        const bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME');
        const region = this.configService.get<string>('AWS_REGION') || 'us-east-1';

        if (!accessKeyId || !secretAccessKey || !bucketName) {
            throw new Error('AWS credentials and bucket name must be configured');
        }

        this.s3Client = new S3Client({
            region,
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
        });
        this.bucketName = bucketName;

        if (!this.bucketName) {
            throw new Error('AWS_S3_BUCKET_NAME is not configured');
        }
    }

    /**
     * Sube un archivo a S3
     * @param file - Archivo a subir
     * @param folder - Carpeta donde guardar el archivo (opcional)
     * @returns URL del archivo subido
     */
    async uploadFile(file: Express.Multer.File, folder?: string): Promise<string> {
        try {
            if (!file) {
                throw new BadRequestException('No se proporcionó ningún archivo');
            }

            // Validar tipo de archivo (opcional - puedes personalizar según tus necesidades)
            const allowedMimeTypes = [
                'application/pdf',
                'image/jpeg',
                'image/png',
                'image/jpg',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            ];

            if (!allowedMimeTypes.includes(file.mimetype)) {
                throw new BadRequestException('Tipo de archivo no permitido');
            }

            // Validar tamaño del archivo (máximo 10MB)
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (file.size > maxSize) {
                throw new BadRequestException('El archivo es demasiado grande. Máximo 10MB');
            }

            // Generar nombre único para el archivo
            const fileExtension = file.originalname.split('.').pop();
            const fileName = `${uuidv4()}.${fileExtension}`;
            const key = folder ? `${folder}/${fileName}` : fileName;

            // Comando para subir el archivo
            const command = new PutObjectCommand({
                Bucket: this.bucketName,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
                ContentDisposition: 'inline',
                Metadata: {
                    originalName: file.originalname,
                    uploadDate: new Date().toISOString(),
                },
            });

            // Subir el archivo
            await this.s3Client.send(command);

            // Retornar la URL del archivo
            return `https://${this.bucketName}.s3.${this.configService.get<string>('AWS_REGION') || 'us-east-1'}.amazonaws.com/${key}`;
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            console.error('Error uploading file to S3:', error);
            throw new InternalServerErrorException('Error al subir el archivo');
        }
    }

    /**
     * Elimina un archivo de S3
     * @param fileUrl - URL del archivo a eliminar
     */
    async deleteFile(fileUrl: string): Promise<void> {
        try {
            // Extraer la key del archivo de la URL
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
            if (error instanceof BadRequestException) {
                throw error;
            }
            console.error('Error deleting file from S3:', error);
            throw new InternalServerErrorException('Error al eliminar el archivo');
        }
    }

    /**
     * Genera una URL firmada para acceso temporal al archivo
     * @param fileUrl - URL del archivo
     * @param expiresIn - Tiempo de expiración en segundos (default: 3600 = 1 hora)
     * @returns URL firmada
     */
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
            if (error instanceof BadRequestException) {
                throw error;
            }
            console.error('Error generating signed URL:', error);
            throw new InternalServerErrorException('Error al generar URL de acceso');
        }
    }

    /**
     * Extrae la key del archivo de una URL de S3
     * @param url - URL del archivo en S3
     * @returns Key del archivo
     */
    private extractKeyFromUrl(url: string): string | null {
        try {
            const urlObj = new URL(url);
            // Remover el primer slash
            return urlObj.pathname.substring(1);
        } catch {
            return null;
        }
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
