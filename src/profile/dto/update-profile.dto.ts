import { PartialType } from '@nestjs/mapped-types';
import { CreateProfileDto } from './create-profile.dto';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateProfileDto extends PartialType(CreateProfileDto) {

    @IsString()
    @MinLength(3)
    @MaxLength(50)
    name: string;
}
