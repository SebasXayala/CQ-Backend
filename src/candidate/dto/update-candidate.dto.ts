import { PartialType } from '@nestjs/mapped-types';
import { CreateCandidateDto } from './create-candidate.dto';
import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateCandidateDto extends PartialType(CreateCandidateDto) {

    @IsString()
    @MaxLength(50)
    @MinLength(5)
    @IsOptional()
    name?: string;

    @IsString()
    @MaxLength(10)
    @MinLength(3)
    @IsOptional()
    identifier?: string;

    @IsString()
    @MaxLength(20)
    @MinLength(3)
    @IsOptional()
    identifier_type?: string;

    @IsEmail()
    @MaxLength(50)
    @IsOptional()
    email?: string;

    @IsString()
    @MaxLength(10)
    @MinLength(10)
    @IsOptional()
    phone?: string;

    @IsString()
    @MaxLength(30)
    @MinLength(1)
    @IsOptional()
    password?: string;

    @IsInt()
    @IsPositive()
    @IsOptional()
    profile?: number;

    @IsInt()
    @IsPositive()
    @IsOptional()
    candidate_status?: number;

    @IsInt()
    @IsPositive()
    @IsOptional()
    position?: number;
}
