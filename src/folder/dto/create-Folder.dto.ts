import { IsInt, IsDateString } from 'class-validator';

export class CreateFolderDto {
  @IsInt()
  id_candidate: number;

  @IsDateString()
  creation_date: string;

  @IsDateString()
  modification_date: string;
}
