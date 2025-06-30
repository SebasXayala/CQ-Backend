import { IsOptional, IsString } from 'class-validator';

export class UpdateDocumentStatusDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
