import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class CreateListDocumentDto {

    @IsNumber()
    @IsPositive()
    id_profile: number;

    @IsNumber()
    @IsPositive()
    id_required_documents: number;
}
