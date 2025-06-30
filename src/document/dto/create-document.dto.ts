import { IsInt, IsString } from 'class-validator';

export class CreateDocumentDto {
  @IsString()
  document_type: string;

  @IsString()
  document_url: string;

  @IsInt()
  id_folder: number;

  @IsInt()
  id_status: number; // nuevo campo
}
