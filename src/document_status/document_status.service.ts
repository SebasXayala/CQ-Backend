import { Injectable, NotFoundException } from '@nestjs/common';
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
    const documentStatus = this.documentStatusRepository.create(createDocumentStatusDto);
    return await this.documentStatusRepository.save(documentStatus);
  }

  async findAll(): Promise<DocumentStatus[]> {
    return await this.documentStatusRepository.find();
  }

  async findOne(id: number): Promise<DocumentStatus> {
    const documentStatus = await this.documentStatusRepository.findOne({
      where: { id_document_status: id }
    });

    if (!documentStatus) {
      throw new NotFoundException(`DocumentStatus with ID ${id} not found`);
    }

    return documentStatus;
  }

  async update(id: number, updateDocumentStatusDto: UpdateDocumentStatusDto): Promise<DocumentStatus> {
    await this.findOne(id); // Verifica que existe

    await this.documentStatusRepository.update(
      { id_document_status: id },
      updateDocumentStatusDto
    );

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const documentStatus = await this.findOne(id); // Verifica que existe
    await this.documentStatusRepository.remove(documentStatus);
  }
}
