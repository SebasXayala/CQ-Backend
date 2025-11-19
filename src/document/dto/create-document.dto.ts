import {
    IsNumber,
    IsDateString,
    IsOptional,
    IsNotEmpty
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateDocumentDto {
    @Transform(({ value }) => parseInt(value, 10))
    @IsNumber({}, { message: 'El id_folder debe ser un número válido' })
    @IsNotEmpty({ message: 'El id_folder es requerido' })
    readonly id_folder: number;

    @IsOptional()
    @IsDateString({}, { message: 'La fecha de modificación debe tener formato ISO válido' })
    readonly modificationDate?: Date;
}