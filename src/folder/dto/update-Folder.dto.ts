import { IsOptional, IsInt, IsDateString } from 'class-validator';

export class UpdateFolderDto {
  @IsOptional()
  @IsInt()
  id_candidate?: number;

  @IsOptional()
  @IsDateString()
  creation_date?: string;

  @IsOptional()
  @IsDateString()
  modification_date?: string;
}
