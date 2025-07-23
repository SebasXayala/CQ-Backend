import { IsNotEmpty, IsNumber, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateRequiredDocumentsDto {

    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(200)
    name_required_documents: string;

    @IsNotEmpty()
    @IsNumber()
    amount: number;
}
