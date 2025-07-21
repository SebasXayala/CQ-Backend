import { Injectable } from '@nestjs/common';
import { CreateDocumentStatusDto } from './dto/create-document_status.dto';
import { UpdateDocumentStatusDto } from './dto/update-document_status.dto';

@Injectable()
export class DocumentStatusService {
  create(createDocumentStatusDto: CreateDocumentStatusDto) {
    return 'This action adds a new documentStatus';
  }

  findAll() {
    return `This action returns all documentStatus`;
  }

  findOne(id: number) {
    return `This action returns a #${id} documentStatus`;
  }

  update(id: number, updateDocumentStatusDto: UpdateDocumentStatusDto) {
    return `This action updates a #${id} documentStatus`;
  }

  remove(id: number) {
    return `This action removes a #${id} documentStatus`;
  }
}
