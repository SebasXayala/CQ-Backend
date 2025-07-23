import { PartialType } from '@nestjs/mapped-types';
import { CreateDocumentStatusDto } from './create-document_status.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateDocumentStatusDto extends PartialType(CreateDocumentStatusDto) {

    @IsString()
    @IsOptional()
    status?: string;

    @IsString()
    @IsOptional()
    description?: string;
}
