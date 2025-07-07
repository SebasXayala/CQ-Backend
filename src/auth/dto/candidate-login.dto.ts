import { IsNotEmpty, IsString } from 'class-validator';

export class CandidateLoginDto {
    @IsNotEmpty()
    @IsString()
    identifier: string;
}
