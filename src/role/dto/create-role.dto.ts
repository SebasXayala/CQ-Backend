import { IsString, IsNotEmpty, IsOptional, MaxLength, MinLength } from 'class-validator';

export class CreateRoleDto {


    @IsString()
    @IsNotEmpty()
    @MaxLength(10)
    @MinLength(3)
    name: string;

    @IsString()
    @MaxLength(30)
    @MinLength(10)
    description: string;
}