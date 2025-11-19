import { Transform } from 'class-transformer';
import { IsEmail, IsInt, IsNumber, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {

  @IsString()
  @IsEmail()
  @MaxLength(50)
  email: string;

  @IsString()
  @MaxLength(30)
  @MinLength(1)
  @Transform(({ value }) => value.trim())
  password: string;

  @IsInt()
  id_role: number;
}


