import { IsNumber, IsString, MaxLength, MinLength } from 'class-validator';
export class CreateUserDto {

    @IsString()
    @MaxLength(50)
    email: string;

    @IsString()
    @MaxLength(30)
    @MinLength(1)
    password: string;

    @IsNumber()
    id_role: number;
  }


