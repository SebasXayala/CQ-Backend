import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsNumber, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
    @IsString()
    @MaxLength(50)
    @IsOptional()
    email: string;

    @IsString()
    @MaxLength(30)
    @MinLength(1)
    @IsOptional()
    password: string;

    @IsNumber()
    @IsOptional()
    id_role: number;
}
