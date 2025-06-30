import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentStatus } from './entities/document_status.entity';
import { CreateDocumentStatusDto } from './dto/create-document-status.dto';
import { UpdateDocumentStatusDto } from './dto/update-document-status.dto';

@Injectable()
export class DocumentStatusService {
  constructor(
    @InjectRepository(DocumentStatus)
    private readonly statusRepo: Repository<DocumentStatus>,
  ) {}

  async create(dto: CreateDocumentStatusDto): Promise<DocumentStatus> {
    const status = this.statusRepo.create(dto);
    return this.statusRepo.save(status);
  }

  async findAll(): Promise<DocumentStatus[]> {
    return this.statusRepo.find();
  }

  async findOne(id: number): Promise<DocumentStatus> {
    const status = await this.statusRepo.findOneBy({ id_status: id });
    if (!status) throw new NotFoundException('Status not found');
    return status;
  }

  async update(id: number, dto: UpdateDocumentStatusDto): Promise<DocumentStatus> {
    const status = await this.findOne(id);
    Object.assign(status, dto);
    return this.statusRepo.save(status);
  }

  async remove(id: number): Promise<void> {
    const status = await this.findOne(id);
    await this.statusRepo.remove(status);
  }
}
