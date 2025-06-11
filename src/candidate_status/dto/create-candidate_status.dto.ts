import { IsEmail, IsNumber, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCandidateStatusDto {

    @IsString()
    @MaxLength(20)
    @MinLength(3)
    state: string;

    @IsString()
    @MaxLength(50)
    @MinLength(3)
    description: string;
}
