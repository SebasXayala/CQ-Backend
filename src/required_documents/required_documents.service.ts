import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { CreateRequiredDocumentsDto } from './dto/create-required_documents.dto';
import { UpdateRequiredDocumentsDto } from './dto/update-required_documents.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RequiredDocuments } from './entities/required_documents.entity';
import { Profile } from 'src/profile/entities/profile.entity';

@Injectable()
export class RequiredDocumentsService {
    constructor(
        @InjectRepository(RequiredDocuments)
        private readonly requiredDocumentsRepository: Repository<RequiredDocuments>,
        @InjectRepository(Profile)
        private readonly profileRepository: Repository<Profile>,
    ) { }

    async create(createRequiredDocumentsDto: CreateRequiredDocumentsDto) {
        // Validar que el perfil exista
        const profile = await this.profileRepository.findOneBy({ id_profile: createRequiredDocumentsDto.id_profile });
        if (!profile) {
            throw new NotFoundException(`No se encontró Perfil con id ${createRequiredDocumentsDto.id_profile}`);
        }

        const requiredDocuments = this.requiredDocumentsRepository.create(createRequiredDocumentsDto);
        return this.requiredDocumentsRepository.save(requiredDocuments);
    }

    async findAll(): Promise<RequiredDocuments[]> {
        return this.requiredDocumentsRepository.find({
            relations: ['profile'],
        });
    }

    async findOne(id: number): Promise<RequiredDocuments> {
        if (!Number.isInteger(id) || id <= 0) {
            throw new BadRequestException('El id debe ser un número entero positivo');
        }
        const requiredDocuments = await this.requiredDocumentsRepository.findOne({
            where: { id_required_documents: id },
            relations: ['profile'],
        });
        if (!requiredDocuments) {
            throw new NotFoundException(`No se encontró Documento Requerido con id ${id}`);
        }
        return requiredDocuments;
    }

    async findByProfile(profileId: number): Promise<RequiredDocuments[]> {
        if (!Number.isInteger(profileId) || profileId <= 0) {
            throw new BadRequestException('El id del perfil debe ser un número entero positivo');
        }
        return this.requiredDocumentsRepository.find({
            where: { id_profile: profileId },
            relations: ['profile'],
        });
    }

    async update(id: number, updateRequiredDocumentsDto: UpdateRequiredDocumentsDto): Promise<RequiredDocuments> {
        if (!Number.isInteger(id) || id <= 0) {
            throw new BadRequestException('El id debe ser un número entero positivo');
        }
        const requiredDocuments = await this.requiredDocumentsRepository.findOneBy({ id_required_documents: id });
        if (!requiredDocuments) {
            throw new NotFoundException(`No se encontró Documento Requerido con id ${id}`);
        }

        // Validar que el perfil exista si se actualiza
        if (updateRequiredDocumentsDto.id_profile) {
            const profile = await this.profileRepository.findOneBy({ id_profile: updateRequiredDocumentsDto.id_profile });
            if (!profile) {
                throw new NotFoundException(`No se encontró Perfil con id ${updateRequiredDocumentsDto.id_profile}`);
            }
        }

        await this.requiredDocumentsRepository.update(id, updateRequiredDocumentsDto);
        return this.findOne(id);
    }

    async remove(id: number): Promise<RequiredDocuments> {
        if (!Number.isInteger(id) || id <= 0) {
            throw new BadRequestException('El id debe ser un número entero positivo');
        }
        const requiredDocuments = await this.requiredDocumentsRepository.findOneBy({ id_required_documents: id });
        if (!requiredDocuments) {
            throw new NotFoundException(`No se encontró Documento Requerido con id ${id}`);
        }

        const result = await this.requiredDocumentsRepository.delete(id);
        if (result.affected === 0) throw new NotFoundException(`No se encontró Documento Requerido con id ${id}`);
        return requiredDocuments;
    }
}
