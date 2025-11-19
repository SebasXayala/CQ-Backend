import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { Document } from './entities/document.entity';
import { DocumentStatus } from '../document_status/entities/document_status.entity';
import { Folder } from '../folder/entities/folder.entity';
import { S3Service } from '../common/services/s3.service';

@Injectable()
export class DocumentService {

  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    @InjectRepository(DocumentStatus)
    private readonly documentStatusRepository: Repository<DocumentStatus>,
    @InjectRepository(Folder)
    private readonly folderRepository: Repository<Folder>,
    private readonly s3Service: S3Service,
  ) { }


  /**
   * Crear documento con archivo subido a S3
   */
  async create(createDocumentDto: CreateDocumentDto, file: Express.Multer.File): Promise<Document> {
    const { id_folder, modificationDate } = createDocumentDto;

    // El estado del documento siempre será 3
    const id_document_status = 3;

    // Validar que el folder existe
    const folder = await this.folderRepository.findOne({ where: { id_folder } });
    if (!folder) {
      throw new NotFoundException(`No se encontró la carpeta con id ${id_folder}`);
    }

    // Validar que el estado del documento existe (estado 3)
    const documentStatus = await this.documentStatusRepository.findOne({ where: { id_document_status } });
    if (!documentStatus) {
      throw new NotFoundException(`No se encontró el estado de documento con id ${id_document_status}`);
    }

    // Usar el nombre original del archivo como document_name
    const document_name = file.originalname;

    // Validar unicidad de nombre de documento en la misma carpeta
    const existingDocument = await this.documentRepository.findOne({
      where: {
        document_name,
        id_folder
      }
    });
    if (existingDocument) {
      throw new ConflictException(`Ya existe un documento con el nombre "${document_name}" en esta carpeta`);
    }

    try {
      // Subir archivo a S3
      const folderPath = `documents/folder_${id_folder}`;
      const uploadResult = await this.s3Service.uploadFile(file, folderPath);

      // Crear el documento en la base de datos
      const document = this.documentRepository.create({
        document_name,
        id_document_status,
        id_folder,
        document_url: uploadResult.url,
        modification_date: modificationDate || new Date()
      });

      return await this.documentRepository.save(document);
    } catch (error) {
      // Si hay error al subir a S3, propagar el error
      throw error;
    }
  }

  async findAll(): Promise<Document[]> {
    return await this.documentRepository.find({
      relations: ['documentStatus', 'folder']
    });
  }

  async findOne(id: number): Promise<Document> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException('El id debe ser un número entero positivo');
    }

    const document = await this.documentRepository.findOne({
      where: { id_document: id },
      relations: ['documentStatus', 'folder']
    });

    if (!document) {
      throw new NotFoundException(`No se encontró el documento con id ${id}`);
    }

    return document;
  }

  async findByFolder(id_folder: number): Promise<any> {
    if (!Number.isInteger(id_folder) || id_folder <= 0) {
      throw new BadRequestException('El id_folder debe ser un número entero positivo');
    }

    const documents = await this.documentRepository.find({
      where: { id_folder },
      relations: ['documentStatus', 'folder'],
      order: { modification_date: 'DESC' }
    });

    return {
      folder_info: documents[0]?.folder || null,
      total_documents: documents.length,
      documents: documents.map(doc => ({
        id_document: doc.id_document,
        document_name: doc.document_name,
        document_url: doc.document_url,
        modification_date: doc.modification_date,
        status: {
          id: doc.documentStatus.id_document_status,
          name: doc.documentStatus.status,
          description: doc.documentStatus.description
        }
      }))
    };
  }

  async update(id: number, updateDocumentDto: UpdateDocumentDto): Promise<Document> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException('El id debe ser un número entero positivo');
    }

    const document = await this.documentRepository.findOne({ where: { id_document: id } });
    if (!document) {
      throw new NotFoundException(`No se encontró el documento con id ${id}`);
    }

    // Actualizar solo los campos proporcionados
    if (updateDocumentDto.modificationDate) {
      document.modification_date = new Date(updateDocumentDto.modificationDate);
    }

    // Si se proporciona id_folder, validar que existe
    if (updateDocumentDto.id_folder) {
      const folder = await this.folderRepository.findOne({ where: { id_folder: updateDocumentDto.id_folder } });
      if (!folder) {
        throw new NotFoundException(`No se encontró la carpeta con id ${updateDocumentDto.id_folder}`);
      }
      document.id_folder = updateDocumentDto.id_folder;
    }

    return await this.documentRepository.save(document);
  }

  async remove(id: number): Promise<void> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException('El id debe ser un número entero positivo');
    }

    const document = await this.documentRepository.findOne({ where: { id_document: id } });
    if (!document) {
      throw new NotFoundException(`No se encontró el documento con id ${id}`);
    }

    try {
      // Si el documento tiene una URL en S3, eliminar el archivo
      if (document.document_url && document.document_url.trim() !== '') {
        await this.s3Service.deleteFile(document.document_url);
      }

      // Eliminar el registro de la base de datos
      await this.documentRepository.remove(document);
    } catch (error) {
      // Si hay error al eliminar de S3, aún eliminar de la BD pero loggear el error
      console.error('Error deleting file from S3:', error);
      await this.documentRepository.remove(document);
    }
  }

  /**
   * Obtener URL firmada para descargar un documento
   */
  async getDownloadUrl(id: number, expiresIn: number = 3600): Promise<string> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException('El id debe ser un número entero positivo');
    }

    const document = await this.documentRepository.findOne({ where: { id_document: id } });
    if (!document) {
      throw new NotFoundException(`No se encontró el documento con id ${id}`);
    }

    if (!document.document_url || document.document_url.trim() === '') {
      throw new BadRequestException('Este documento no tiene un archivo asociado');
    }

    const signed = await this.s3Service.getSignedUrl(document.document_url, expiresIn);
    return signed.url;
  }

  /**
   * Reemplazar archivo de un documento existente
   */
  async replaceFile(id: number, file: Express.Multer.File): Promise<Document> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException('El id debe ser un número entero positivo');
    }

    const document = await this.documentRepository.findOne({
      where: { id_document: id },
      relations: ['folder'] // Agregar relación si necesitas validar candidato
    });
    if (!document) {
      throw new NotFoundException(`No se encontró el documento con id ${id}`);
    }

    try {
      // Si existe un archivo anterior, intentar eliminarlo de S3
      if (document.document_url && document.document_url.trim() !== '') {
        try {
          await this.s3Service.deleteFile(document.document_url);
        } catch (deleteError) {
          // Log del error pero continúa el proceso
          console.warn('No se pudo eliminar el archivo anterior de S3:', deleteError.message);
        }
      }

      // Subir el nuevo archivo
      const folderPath = `documents/folder_${document.id_folder}`;
      const uploadResult = await this.s3Service.uploadFile(file, folderPath);

      // Actualizar el documento
      document.document_url = uploadResult.url;
      document.document_name = file.originalname;
      document.modification_date = new Date();

      return await this.documentRepository.save(document);
    } catch (error) {
      // Si hay error al subir el nuevo archivo, propagar el error
      throw error;
    }
  }

  /**
   * Cambiar el estado del documento a id_document_status = 4
   */
  async setStatusAccepted(id_document: number): Promise<Document> {
    if (!Number.isInteger(id_document) || id_document <= 0) {
      throw new BadRequestException('El id debe ser un número entero positivo');
    }

    const document = await this.documentRepository.findOne({ where: { id_document: id_document } });
    if (!document) {
      throw new NotFoundException(`No se encontró el documento con id ${id_document}`);
    }

    const status = await this.documentStatusRepository.findOne({ where: { id_document_status: 4 } });
    if (!status) {
      throw new NotFoundException('No se encontró el estado de documento con id 4');
    }

    document.documentStatus = status;
    document.id_document_status = 4;
    document.modification_date = new Date();
    return await this.documentRepository.save(document);
  }

  /**
   * Crear un nuevo DocumentStatus especial (Refrendado) y asociarlo a un documento
   */
  async createSpecialEndorsed(documentId: number, description: string): Promise<Document> {
    if (!Number.isInteger(documentId) || documentId <= 0) {
      throw new BadRequestException('El id del documento debe ser un número entero positivo');
    }
    if (!description || description.trim() === '') {
      throw new BadRequestException('La descripción es obligatoria');
    }

    const document = await this.documentRepository.findOne({ where: { id_document: documentId } });
    if (!document) {
      throw new NotFoundException(`No se encontró el documento con id ${documentId}`);
    }

    // Crear el nuevo DocumentStatus especial
    const newStatus = this.documentStatusRepository.create({
      status: 'Refrendado',
      description: description
    });
    const savedStatus = await this.documentStatusRepository.save(newStatus);

    // Asociar el nuevo status al documento
    document.documentStatus = savedStatus;
    document.id_document_status = savedStatus.id_document_status;
    document.modification_date = new Date();
    return await this.documentRepository.save(document);
  }
}
