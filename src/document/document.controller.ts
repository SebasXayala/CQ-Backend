import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  ParseIntPipe,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UsePipes,
  ValidationPipe,
  NotFoundException,
  Res
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentService } from './document.service';
import { S3Service } from '../common/services/s3.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

@Controller('document')
export class DocumentController {
  constructor(
    private readonly documentService: DocumentService,
    private readonly s3Service: S3Service,
  ) { }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @UsePipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: false,
    transform: true,
  }))
  async create(
    @Body() createDocumentDto: CreateDocumentDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }
    return this.documentService.create(createDocumentDto, file);
  }

  @Get()
  findAll() {
    return this.documentService.findAll();
  }

  @Get('folder/:folderId')
  findByFolder(
    @Param('folderId', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }))
    folderId: number
  ) {
    return this.documentService.findByFolder(folderId);
  }

  @Get(':id')
  findOne(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }))
    id: number
  ) {
    return this.documentService.findOne(id);
  }

  @Get(':id/download')
  async downloadDocument(@Param('id') id: string) {
    const numericId = Number(id);
    const document = await this.documentService.findOne(numericId);
    if (!document) {
      throw new NotFoundException('Documento no encontrado');
    }

    const { url } = await this.s3Service.getSignedUrl(document.document_url, 60);

    return {
      url,
      filename: document.document_name,
    };
  }




  @Patch(':id')
  update(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }))
    id: number,
    @Body() updateDocumentDto: UpdateDocumentDto
  ) {
    return this.documentService.update(id, updateDocumentDto);
  }

  @Put(':id/update')
  @UseInterceptors(FileInterceptor('file'))
  async updateDocument(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }))
    id: number,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }
    return this.documentService.replaceFile(id, file);
  }

  @Patch(':id/replace-file')
  @UseInterceptors(FileInterceptor('file'))
  async replaceFile(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }))
    id: number,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }
    return this.documentService.replaceFile(id, file);
  }

  @Delete(':id')
  remove(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }))
    id: number
  ) {
    return this.documentService.remove(id);
  }

  @Patch(':id/status-accepted')
  async setStatusAccepted(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }))
    id: number
  ) {
    return this.documentService.setStatusAccepted(id);
  }

  @Post(':id/special-endorsed')
  async createSpecialEndorsed(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }))
    id: number,
    @Body('description') description: string
  ) {
    return this.documentService.createSpecialEndorsed(id, description);
  }
}
