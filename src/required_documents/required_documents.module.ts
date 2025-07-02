import { Module } from '@nestjs/common';
import { RequiredDocumentsService } from './required_documents.service';
import { RequiredDocumentsController } from './required_documents.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequiredDocuments } from './entities/required_documents.entity';
import { Profile } from 'src/profile/entities/profile.entity';

@Module({
    imports: [TypeOrmModule.forFeature([RequiredDocuments, Profile])],
    controllers: [RequiredDocumentsController],
    providers: [RequiredDocumentsService],
    exports: [TypeOrmModule, RequiredDocumentsService],
})
export class RequiredDocumentsModule { }
