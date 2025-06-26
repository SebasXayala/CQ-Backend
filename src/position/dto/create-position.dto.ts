import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreatePositionDto {

    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(50)
    name: string;
}
