import { PartialType } from '@nestjs/mapped-types';
import { CreateDocumentStatusDto } from './create-document_status.dto';

export class UpdateDocumentStatusDto extends PartialType(CreateDocumentStatusDto) {}
