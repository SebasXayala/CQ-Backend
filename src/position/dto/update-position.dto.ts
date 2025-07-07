import { PartialType } from '@nestjs/mapped-types';
import { CreatePositionDto } from './create-position.dto';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class UpdatePositionDto extends PartialType(CreatePositionDto) {

    @IsString()
    @MinLength(3)
    @MaxLength(50)
    name: string;
}
