import { IsInt, IsNotEmpty, IsPositive, IsString, MaxLength, MinLength } from 'class-validator';



export class CreateCandidateDto {

    @IsString()
    @MaxLength(50)
    @MinLength(8)
    @IsNotEmpty()
    name: string;

    @IsString()
    @MaxLength(10)
    @MinLength(8)
    @IsNotEmpty()
    identifier: string;

    @IsString()
    @MaxLength(20)
    @MinLength(8)
    @IsNotEmpty()
    identifier_type: string;

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
