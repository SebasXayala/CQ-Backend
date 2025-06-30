import { IsString } from 'class-validator';

export class CreateDocumentStatusDto {
  @IsString()
  name: string;

  @IsString()
  description: string;
}
