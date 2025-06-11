import { PartialType } from '@nestjs/mapped-types';
import { CreateSelectionProcessDto } from './create-selection_process.dto';

export class UpdateSelectionProcessDto extends PartialType(CreateSelectionProcessDto) {}
