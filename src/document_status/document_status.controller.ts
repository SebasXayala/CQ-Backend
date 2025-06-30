import { Controller, Post, Get, Put, Delete, Param, Body } from '@nestjs/common';
import { DocumentStatusService } from './document_status.service';
import { CreateDocumentStatusDto } from './dto/create-document-status.dto';
import { UpdateDocumentStatusDto } from './dto/update-document-status.dto';

@Controller('document-status')
export class DocumentStatusController {
  constructor(private readonly service: DocumentStatusService) {}

  @Post()
  create(@Body() dto: CreateDocumentStatusDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.service.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() dto: UpdateDocumentStatusDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(+id);
  }
}
