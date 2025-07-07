import { Module } from '@nestjs/common';
import { ListDocumentService } from './list_document.service';
import { ListDocumentController } from './list_document.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListDocument } from './entities/list_document.entity';
import { Profile } from 'src/profile/entities/profile.entity';
import { RequiredDocuments } from 'src/required_documents/entities/required_documents.entity';

@Module({
    imports: [TypeOrmModule.forFeature([ListDocument, Profile, RequiredDocuments])],
    controllers: [ListDocumentController],
    providers: [ListDocumentService],
    exports: [TypeOrmModule, ListDocumentService],
})
export class ListDocumentModule { }
