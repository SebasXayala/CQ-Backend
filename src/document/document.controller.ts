import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentService } from './document.service';
import { CreateDocumentDto, CreateDocumentWithFileDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

@Controller('document')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) { }

  @Post()
  create(@Body() createDocumentDto: CreateDocumentDto) {
    return this.documentService.create(createDocumentDto);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async createWithFile(
    @Body() createDocumentDto: CreateDocumentWithFileDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }
    return this.documentService.createWithFile(createDocumentDto, file);
  }

  @Get()
  findAll() {
    return this.documentService.findAll();
  }

  @Get('folder/:folderId')
  findByFolder(@Param('folderId', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) folderId: number) {
    return this.documentService.findByFolder(folderId);
  }

  @Get(':id')
  findOne(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) id: number) {
    return this.documentService.findOne(id);
  }

  @Get(':id/download')
  async getDownloadUrl(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) id: number
  ) {
    const downloadUrl = await this.documentService.getDownloadUrl(id);
    return { downloadUrl };
  }

  @Patch(':id')
  update(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) id: number,
    @Body() updateDocumentDto: UpdateDocumentDto
  ) {
    return this.documentService.update(id, updateDocumentDto);
  }

  @Patch(':id/replace-file')
  @UseInterceptors(FileInterceptor('file'))
  async replaceFile(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) id: number,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }
    return this.documentService.replaceFile(id, file);
  }

  @Delete(':id')
  remove(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) id: number) {
    return this.documentService.remove(id);
  }
}
