import { IsNotEmpty, IsString, MaxLength, MinLength, IsNumber, IsPositive } from 'class-validator';

export class CreateRequiredDocumentsDto {

    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(80)
    name_required_documents: string;

    @IsNumber()
    @IsPositive()
    id_profile: number;
}
