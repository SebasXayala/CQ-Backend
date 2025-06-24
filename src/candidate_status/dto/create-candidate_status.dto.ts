import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCandidateStatusDto {

    @IsString()
    @MaxLength(20)
    @MinLength(3)
    status: string;

    @IsString()
    @MaxLength(100)
    @MinLength(3)
    description: string;
}
