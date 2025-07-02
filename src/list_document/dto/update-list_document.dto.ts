import { PartialType } from '@nestjs/mapped-types';
import { CreateListDocumentDto } from './create-list_document.dto';

export class UpdateListDocumentDto extends PartialType(CreateListDocumentDto) { }
