import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './entities/document.entuty';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { CreateDocumentDto } from './dto/create-document.dto';
import { Folder } from 'src/folder/entities/folder.entity';

@Injectable()
export class DocumentService {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepo: Repository<Document>,
    @InjectRepository(Folder)
    private readonly folderRepo: Repository<Folder>,
  ) {}

  async create(dto: CreateDocumentDto): Promise<Document> {
    const folder = await this.folderRepo.findOneBy({ id_folder: dto.id_folder });
    if (!folder) throw new NotFoundException('Folder not found');

    const document = this.documentRepo.create({
      document_type: dto.document_type,
      document_url: dto.document_url,
      folder,
    });

    return this.documentRepo.save(document);
  }

  async findAll(): Promise<Document[]> {
    return this.documentRepo.find({ relations: ['folder'] });
  }

  async findOne(id: number): Promise<Document> {
    const doc = await this.documentRepo.findOne({
      where: { id_document: id },
      relations: ['folder'],
    });
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }

  async update(id: number, dto: UpdateDocumentDto): Promise<Document> {
    const document = await this.findOne(id);

    if (dto.id_folder) {
      const folder = await this.folderRepo.findOneBy({ id_folder: dto.id_folder });
      if (!folder) throw new NotFoundException('Folder not found');
      document.folder = folder;
    }

    Object.assign(document, dto);
    return this.documentRepo.save(document);
  }

  async remove(id: number): Promise<void> {
    const document = await this.findOne(id);
    await this.documentRepo.remove(document);
  }
}
