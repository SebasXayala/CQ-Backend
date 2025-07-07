import { Module } from '@nestjs/common';
import { RequiredDocumentsService } from './required_documents.service';
import { RequiredDocumentsController } from './required_documents.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequiredDocuments } from './entities/required_documents.entity';

@Module({
    imports: [TypeOrmModule.forFeature([RequiredDocuments])],
    controllers: [RequiredDocumentsController],
    providers: [RequiredDocumentsService],
    exports: [TypeOrmModule, RequiredDocumentsService],
})
export class RequiredDocumentsModule { }
