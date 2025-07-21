import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DocumentStatusService } from './document_status.service';
import { CreateDocumentStatusDto } from './dto/create-document_status.dto';
import { UpdateDocumentStatusDto } from './dto/update-document_status.dto';

@Controller('document-status')
export class DocumentStatusController {
  constructor(private readonly documentStatusService: DocumentStatusService) {}

  @Post()
  create(@Body() createDocumentStatusDto: CreateDocumentStatusDto) {
    return this.documentStatusService.create(createDocumentStatusDto);
  }

  @Get()
  findAll() {
    return this.documentStatusService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.documentStatusService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDocumentStatusDto: UpdateDocumentStatusDto) {
    return this.documentStatusService.update(+id, updateDocumentStatusDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.documentStatusService.remove(+id);
  }
}
