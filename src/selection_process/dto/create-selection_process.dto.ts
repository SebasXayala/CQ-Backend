import { IsInt, IsDateString, IsOptional } from 'class-validator';

export class CreateSelectionProcessDto {
  @IsInt({ message: 'El id_candidate debe ser un número entero' })
  id_candidate: number;

  @IsDateString({}, { message: 'El start_date debe ser una fecha válida (ISO 8601)' })
  start_date: Date;
  
  @IsOptional()
  @IsDateString({}, { message: 'El end_date debe ser una fecha válida (ISO 8601)' })
  end_date?: Date;
}
