import { IsEmail, IsInt, IsNotEmpty, IsPositive, IsString, MaxLength, MinLength } from 'class-validator';



export class CreateCandidateDto {

    @IsString()
    @MaxLength(50)
    @MinLength(5)
    @IsNotEmpty()
    name: string;

    @IsString()
    @MaxLength(10)
    @MinLength(3)
    @IsNotEmpty()
    identifier: string;

    @IsString()
    @MaxLength(20)
    @MinLength(3)
    @IsNotEmpty()
    identifier_type: string;

    @IsEmail()
    @MaxLength(50)
    @IsNotEmpty()
    email: string;

    @IsString()
    @MaxLength(10)
    @MinLength(10)
    @IsNotEmpty()
    phone: string;

    @IsInt()
    @IsPositive()
    @IsNotEmpty()
    profile: number;

    @IsInt()
    @IsPositive()
    @IsNotEmpty()
    candidate_status: number;

    @IsInt()
    @IsPositive()
    @IsNotEmpty()
    position: number;
}
