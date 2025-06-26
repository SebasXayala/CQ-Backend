import { PartialType } from '@nestjs/mapped-types';
import { CreateCandidateStatusDto } from './create-candidate_status.dto';
import { IsString, MaxLength, MinLength, IsOptional } from 'class-validator';

export class UpdateCandidateStatusDto extends PartialType(CreateCandidateStatusDto) {

    @IsString()
    @MaxLength(20)
    @MinLength(3)
    @IsOptional()
    status:string;

    @IsString()
    @MaxLength(50)
    @MinLength(3)
    @IsOptional()
    description:string;
}
