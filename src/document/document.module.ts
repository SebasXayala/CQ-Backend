import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';
import { Document } from './entities/document.entity';
import { DocumentStatus } from '../document_status/entities/document_status.entity';
import { Folder } from '../folder/entities/folder.entity';
import { S3Service } from '../common/services/s3.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Document, DocumentStatus, Folder])
  ],
  controllers: [DocumentController],
  providers: [DocumentService, S3Service],
  exports: [DocumentService],
})
export class DocumentModule { }
