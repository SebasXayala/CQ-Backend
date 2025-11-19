import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";


export class CreateDocumentStatusDto {

    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    status: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    description: string;
}
