import { Transform } from 'class-transformer';
import { IsEmail, IsNumber, IsString, MaxLength, MinLength } from 'class-validator';
export class CreateUserDto {

    @IsString()
    @IsEmail()
    @MaxLength(50)
    email: string;

    @IsString()
    @MaxLength(30)
    @MinLength(1)
    @Transform(({value}) => value.trim())
    password: string;

    @IsNumber()
    id_role: number;
  }


