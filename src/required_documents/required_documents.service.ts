import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateRequiredDocumentsDto } from './dto/create-required_documents.dto';
import { UpdateRequiredDocumentsDto } from './dto/update-required_documents.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RequiredDocuments } from './entities/required_documents.entity';

@Injectable()
export class RequiredDocumentsService {
    constructor(
        @InjectRepository(RequiredDocuments)
        private readonly requiredDocumentsRepository: Repository<RequiredDocuments>,
    ) { }

    async create(createRequiredDocumentsDto: CreateRequiredDocumentsDto) {
        const requiredDocuments = this.requiredDocumentsRepository.create(createRequiredDocumentsDto);
        return this.requiredDocumentsRepository.save(requiredDocuments);
    }

    async findAll(): Promise<RequiredDocuments[]> {
        return this.requiredDocumentsRepository.find();
    }

    async findOne(id: number): Promise<RequiredDocuments> {
        if (!Number.isInteger(id) || id <= 0) {
            throw new BadRequestException('El id debe ser un número entero positivo');
        }
        const requiredDocuments = await this.requiredDocumentsRepository.findOne({
            where: { id_required_documents: id },
        });
        if (!requiredDocuments) {
            throw new NotFoundException(`No se encontró Documento Requerido con id ${id}`);
        }
        return requiredDocuments;
    }

    async update(id: number, updateRequiredDocumentsDto: UpdateRequiredDocumentsDto): Promise<RequiredDocuments> {
        if (!Number.isInteger(id) || id <= 0) {
            throw new BadRequestException('El id debe ser un número entero positivo');
        }
        const requiredDocuments = await this.requiredDocumentsRepository.findOneBy({ id_required_documents: id });
        if (!requiredDocuments) {
            throw new NotFoundException(`No se encontró Documento Requerido con id ${id}`);
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
