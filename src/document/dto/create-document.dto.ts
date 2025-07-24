import { IsString, IsNotEmpty, IsNumber, IsDateString, IsOptional, MaxLength } from 'class-validator';

export class CreateDocumentDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(20)
    document_type: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    document_name: string;

    @IsNumber()
    @IsNotEmpty()
    id_document_status: number;

    @IsNumber()
    @IsNotEmpty()
    id_folder: number;

    @IsOptional()
    @IsDateString()
    modification_date?: Date;
}

// DTO para crear documento con archivo
export class CreateDocumentWithFileDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(20)
    document_type: string;

    @IsNumber()
    @IsNotEmpty()
    id_document_status: number;

    @IsNumber()
    @IsNotEmpty()
    id_folder: number;

    @IsOptional()
    @IsDateString()
    modification_date?: Date;
}
