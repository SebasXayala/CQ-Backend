import { IsOptional, IsString, IsInt } from 'class-validator';

export class UpdateDocumentDto {
  @IsOptional()
  @IsString()
  document_type?: string;

  @IsOptional()
  @IsString()
  document_url?: string;

  @IsOptional()
  @IsInt()
  id_folder?: number;

  @IsOptional()
  @IsInt()
  id_status?: number;
}
