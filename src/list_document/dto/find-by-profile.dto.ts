import { IsInt, IsPositive } from 'class-validator';

export class FindByProfileDto {
    @IsInt({ message: 'El id del perfil debe ser un número entero' })
    @IsPositive({ message: 'El id del perfil debe ser un número positivo' })
    id_profile: number;
}
