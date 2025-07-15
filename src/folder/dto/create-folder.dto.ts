import { IsNotEmpty, IsNumber, IsDateString, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateCandidateDto } from '../../candidate/dto/create-candidate.dto';

export class CreateFolderDto {

    @IsOptional()
    @IsNumber()
    id_candidate?: number;

    @IsOptional()
    @ValidateNested()
    @Type(() => CreateCandidateDto)
    candidateData?: CreateCandidateDto;

    @IsOptional()
    @IsDateString()
    creation_date?: string;

    @IsOptional()
    @IsDateString()
    modification_date?: string;
}
