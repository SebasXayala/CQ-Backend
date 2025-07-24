import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDocumentDto, CreateDocumentWithFileDto } from './dto/create-document.dto';
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

  async create(createDocumentDto: CreateDocumentDto): Promise<Document> {
    const { document_type, document_name, id_document_status, id_folder, modification_date } = createDocumentDto;

    // Validar que el folder existe
    const folder = await this.folderRepository.findOne({ where: { id_folder } });
    if (!folder) {
      throw new NotFoundException(`No se encontró la carpeta con id ${id_folder}`);
    }

    // Validar que el estado del documento existe
    const documentStatus = await this.documentStatusRepository.findOne({ where: { id_document_status } });
    if (!documentStatus) {
      throw new NotFoundException(`No se encontró el estado de documento con id ${id_document_status}`);
    }

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

    const document = this.documentRepository.create({
      ...createDocumentDto,
      document_url: '', // URL vacía para documentos creados sin archivo
      modification_date: modification_date || new Date()
    });

    return await this.documentRepository.save(document);
  }

  /**
   * Crear documento con archivo subido a S3
   */
  async createWithFile(createDocumentDto: CreateDocumentWithFileDto, file: Express.Multer.File): Promise<Document> {
    const { document_type, id_document_status, id_folder, modification_date } = createDocumentDto;

    // Validar que el folder existe
    const folder = await this.folderRepository.findOne({ where: { id_folder } });
    if (!folder) {
      throw new NotFoundException(`No se encontró la carpeta con id ${id_folder}`);
    }

    // Validar que el estado del documento existe
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
      const document_url = await this.s3Service.uploadFile(file, folderPath);

      // Crear el documento en la base de datos
      const document = this.documentRepository.create({
        document_type,
        document_name,
        id_document_status,
        id_folder,
        document_url,
        modification_date: modification_date || new Date()
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

  async findByFolder(folderId: number): Promise<Document[]> {
    if (!Number.isInteger(folderId) || folderId <= 0) {
      throw new BadRequestException('El id de carpeta debe ser un número entero positivo');
    }

    // Verificar que la carpeta existe
    const folder = await this.folderRepository.findOne({ where: { id_folder: folderId } });
    if (!folder) {
      throw new NotFoundException(`No se encontró la carpeta con id ${folderId}`);
    }

    return await this.documentRepository.find({
      where: { id_folder: folderId },
      relations: ['documentStatus', 'folder']
    });
  }

  async update(id: number, updateDocumentDto: UpdateDocumentDto): Promise<Document> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException('El id debe ser un número entero positivo');
    }

    const document = await this.documentRepository.findOne({ where: { id_document: id } });
    if (!document) {
      throw new NotFoundException(`No se encontró el documento con id ${id}`);
    }

    // Si se actualiza el folder, validar que existe
    if (updateDocumentDto.id_folder) {
      const folder = await this.folderRepository.findOne({ where: { id_folder: updateDocumentDto.id_folder } });
      if (!folder) {
        throw new NotFoundException(`No se encontró la carpeta con id ${updateDocumentDto.id_folder}`);
      }
    }

    // Si se actualiza el estado del documento, validar que existe
    if (updateDocumentDto.id_document_status) {
      const documentStatus = await this.documentStatusRepository.findOne({ where: { id_document_status: updateDocumentDto.id_document_status } });
      if (!documentStatus) {
        throw new NotFoundException(`No se encontró el estado de documento con id ${updateDocumentDto.id_document_status}`);
      }
    }

    // Si se actualiza el nombre, validar unicidad en la carpeta
    if (updateDocumentDto.document_name && updateDocumentDto.document_name !== document.document_name) {
      const folderId = updateDocumentDto.id_folder || document.id_folder;
      const existingDocument = await this.documentRepository.findOne({
        where: {
          document_name: updateDocumentDto.document_name,
          id_folder: folderId
        }
      });
      if (existingDocument && existingDocument.id_document !== id) {
        throw new ConflictException(`Ya existe un documento con el nombre "${updateDocumentDto.document_name}" en esta carpeta`);
      }
    }

    // Actualizar fecha de modificación
    const updateData = {
      ...updateDocumentDto,
      modification_date: new Date()
    };

    await this.documentRepository.update(id, updateData);
    return this.findOne(id);
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

    return await this.s3Service.getSignedUrl(document.document_url, expiresIn);
  }

  /**
   * Reemplazar archivo de un documento existente
   */
  async replaceFile(id: number, file: Express.Multer.File): Promise<Document> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException('El id debe ser un número entero positivo');
    }

    const document = await this.documentRepository.findOne({ where: { id_document: id } });
    if (!document) {
      throw new NotFoundException(`No se encontró el documento con id ${id}`);
    }

    try {
      // Si existe un archivo anterior, eliminarlo de S3
      if (document.document_url && document.document_url.trim() !== '') {
        await this.s3Service.deleteFile(document.document_url);
      }

      // Subir el nuevo archivo
      const folderPath = `documents/folder_${document.id_folder}`;
      const newDocumentUrl = await this.s3Service.uploadFile(file, folderPath);

      // Actualizar el documento
      document.document_url = newDocumentUrl;
      document.document_name = file.originalname;
      document.modification_date = new Date();

      return await this.documentRepository.save(document);
    } catch (error) {
      // Si hay error al subir el nuevo archivo, propagar el error
      throw error;
    }
  }
}
