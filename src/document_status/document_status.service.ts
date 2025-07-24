import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDocumentStatusDto } from './dto/create-document_status.dto';
import { UpdateDocumentStatusDto } from './dto/update-document_status.dto';
import { DocumentStatus } from './entities/document_status.entity';

@Injectable()
export class DocumentStatusService {
  constructor(
    @InjectRepository(DocumentStatus)
    private readonly documentStatusRepository: Repository<DocumentStatus>,
  ) { }

  async create(createDocumentStatusDto: CreateDocumentStatusDto): Promise<DocumentStatus> {
    const { status } = createDocumentStatusDto;

    // Validar unicidad del status
    const existingStatus = await this.documentStatusRepository.findOne({
      where: { status }
    });
    if (existingStatus) {
      throw new ConflictException(`Ya existe un estado de documento con el nombre "${status}"`);
    }

    const documentStatus = this.documentStatusRepository.create(createDocumentStatusDto);
    return await this.documentStatusRepository.save(documentStatus);
  }

  async findAll(): Promise<DocumentStatus[]> {
    return await this.documentStatusRepository.find();
  }

  async findOne(id: number): Promise<DocumentStatus> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException('El id debe ser un número entero positivo');
    }

    const documentStatus = await this.documentStatusRepository.findOne({
      where: { id_document_status: id }
    });

    if (!documentStatus) {
      throw new NotFoundException(`No se encontró el estado de documento con id ${id}`);
    }

    return documentStatus;
  }

  async update(id: number, updateDocumentStatusDto: UpdateDocumentStatusDto): Promise<DocumentStatus> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException('El id debe ser un número entero positivo');
    }

    const documentStatus = await this.documentStatusRepository.findOne({
      where: { id_document_status: id }
    });

    if (!documentStatus) {
      throw new NotFoundException(`No se encontró el estado de documento con id ${id}`);
    }

    // Si se actualiza el status, validar unicidad
    if (updateDocumentStatusDto.status && updateDocumentStatusDto.status !== documentStatus.status) {
      const existingStatus = await this.documentStatusRepository.findOne({
        where: { status: updateDocumentStatusDto.status }
      });
      if (existingStatus) {
        throw new ConflictException(`Ya existe un estado de documento con el nombre "${updateDocumentStatusDto.status}"`);
      }
    }

    await this.documentStatusRepository.update(
      { id_document_status: id },
      updateDocumentStatusDto
    );

    return this.findOne(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException('El id debe ser un número entero positivo');
    }

    const documentStatus = await this.documentStatusRepository.findOne({
      where: { id_document_status: id }
    });

    if (!documentStatus) {
      throw new NotFoundException(`No se encontró el estado de documento con id ${id}`);
    }

    await this.documentStatusRepository.remove(documentStatus);

    return { message: `Estado de documento con id ${id} eliminado exitosamente` };
  }
}
