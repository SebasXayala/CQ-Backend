import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Document } from './entities/document.entuty';
import { Folder } from 'src/folder/entities/folder.entity';
import { DocumentStatus } from 'src/document_status/entities/document_status.entity';
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Document, Folder, DocumentStatus])],
  controllers: [DocumentController],
  providers: [DocumentService],
})
export class DocumentModule {}
