import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsInt, IsNumber, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateUserDto extends PartialType(CreateUserDto) {
    
    @IsString()
    @MaxLength(50)
    @IsOptional()
    email: string;

    @IsString()
    @MaxLength(30)
    @MinLength(1)
    @Transform(({ value }) => value.trim())
    @IsOptional()
    password: string;

    @IsInt()
    @IsOptional()
    id_role: number;
}
