import { IsNumber, IsPositive, IsArray, ArrayMinSize } from 'class-validator';

export class ReplaceProfileDocumentsDto {
    @IsArray()
    @ArrayMinSize(0, { message: 'Puede proporcionar un array vacío para eliminar todos los documentos' })
    @IsNumber({}, { each: true })
    @IsPositive({ each: true })
    document_ids: number[];
}
