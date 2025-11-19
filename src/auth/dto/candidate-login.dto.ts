import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CandidateLoginDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    @IsString()
    password: string;
}
