import { PartialType } from '@nestjs/mapped-types';
import { CreateRequiredDocumentsDto } from './create-required_documents.dto';

export class UpdateRequiredDocumentsDto extends PartialType(CreateRequiredDocumentsDto) { }
