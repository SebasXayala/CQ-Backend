import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ReplaceProfileDocumentsDto } from './dto/replace-profile-documents.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ListDocument } from './entities/list_document.entity';
import { Profile } from 'src/profile/entities/profile.entity';
import { RequiredDocuments } from 'src/required_documents/entities/required_documents.entity';

@Injectable()
export class ListDocumentService {
    constructor(
        @InjectRepository(ListDocument)
        private readonly listDocumentRepository: Repository<ListDocument>,
        @InjectRepository(Profile)
        private readonly profileRepository: Repository<Profile>,
        @InjectRepository(RequiredDocuments)
        private readonly requiredDocumentsRepository: Repository<RequiredDocuments>,
    ) { }

    async replaceProfileDocuments(profileId: number, replaceDto: ReplaceProfileDocumentsDto) {
        const { document_ids } = replaceDto;

        // Validar que el perfil exista
        const profile = await this.profileRepository.findOneBy({ id_profile: profileId });
        if (!profile) {
            throw new NotFoundException(`No se encontró Perfil con id ${profileId}`);
        }

        // Si hay documentos para asignar, validar que existan
        let requiredDocuments: RequiredDocuments[] = [];
        if (document_ids.length > 0) {
            requiredDocuments = await this.requiredDocumentsRepository.findBy({
                id_required_documents: In(document_ids)
            });

            if (requiredDocuments.length !== document_ids.length) {
                const foundIds = requiredDocuments.map(doc => doc.id_required_documents);
                const notFoundIds = document_ids.filter(id => !foundIds.includes(id));
                throw new NotFoundException(`No se encontraron los siguientes documentos: ${notFoundIds.join(', ')}`);
            }
        }

        // Eliminar todas las relaciones existentes del perfil
        await this.listDocumentRepository.delete({ id_profile: profileId });

        // Si no hay documentos para asignar, retornar array vacío
        if (document_ids.length === 0) {
            return [];
        }

        // Crear las nuevas relaciones
        const listDocuments = document_ids.map(docId =>
            this.listDocumentRepository.create({
                id_profile: profileId,
                id_required_documents: docId
            })
        );

        const savedDocuments = await this.listDocumentRepository.save(listDocuments);

        // Retornar estructura plana para cada documento creado
        return savedDocuments.map(savedDoc => {
            const requiredDoc = requiredDocuments.find(doc => doc.id_required_documents === savedDoc.id_required_documents);
            return {
                id_profile: savedDoc.id_profile,
                profile_name: profile.name,
                id_required_documents: savedDoc.id_required_documents,
                name_required_documents: requiredDoc?.name_required_documents || 'Documento no encontrado'
            };
        });
    }

    async findAll() {
        const listDocuments = await this.listDocumentRepository.find({
            relations: ['profile', 'requiredDocuments'],
        });

        // Mapear a estructura plana
        return listDocuments.map(doc => ({
            id_profile: doc.id_profile,
            profile_name: doc.profile.name,
            id_required_documents: doc.id_required_documents,
            name_required_documents: doc.requiredDocuments.name_required_documents
        }));
    }

    async findOne(profileId: number, requiredDocumentId: number) {
        if (!Number.isInteger(profileId) || profileId <= 0) {
            throw new BadRequestException('El id del perfil debe ser un número entero positivo');
        }
        if (!Number.isInteger(requiredDocumentId) || requiredDocumentId <= 0) {
            throw new BadRequestException('El id del documento requerido debe ser un número entero positivo');
        }
        const listDocument = await this.listDocumentRepository.findOne({
            where: {
                id_profile: profileId,
                id_required_documents: requiredDocumentId
            },
            relations: ['profile', 'requiredDocuments'],
        });
        if (!listDocument) {
            throw new NotFoundException(`No se encontró Relación entre perfil ${profileId} y documento ${requiredDocumentId}`);
        }

        // Retornar estructura plana
        return {
            id_profile: listDocument.id_profile,
            profile_name: listDocument.profile.name,
            id_required_documents: listDocument.id_required_documents,
            name_required_documents: listDocument.requiredDocuments.name_required_documents
        };
    }

    async findByProfile(profileId: number) {
        // Validar que sea un número positivo
        if (profileId <= 0) {
            throw new BadRequestException('El id del perfil debe ser un número entero positivo');
        }

        // Primero validar que el perfil exista
        const profile = await this.profileRepository.findOneBy({ id_profile: profileId });
        if (!profile) {
            throw new NotFoundException(`No se encontró Perfil con id ${profileId}`);
        }

        const listDocuments = await this.listDocumentRepository.find({
            where: { id_profile: profileId },
            relations: ['profile', 'requiredDocuments'],
        });

        // Si no hay documentos relacionados, lanzar excepción con mensaje informativo
        if (listDocuments.length === 0) {
            throw new NotFoundException(`No hay documentos asociados al perfil "${profile.name}"`);
        }

        // Mapear a estructura plana
        return listDocuments.map(doc => ({
            id_profile: doc.id_profile,
            profile_name: doc.profile.name,
            id_required_documents: doc.id_required_documents,
            name_required_documents: doc.requiredDocuments.name_required_documents,
            amount: doc.requiredDocuments.amount,
        }));
    }

    async remove(profileId: number, requiredDocumentId: number) {
        if (!Number.isInteger(profileId) || profileId <= 0) {
            throw new BadRequestException('El id del perfil debe ser un número entero positivo');
        }
        if (!Number.isInteger(requiredDocumentId) || requiredDocumentId <= 0) {
            throw new BadRequestException('El id del documento requerido debe ser un número entero positivo');
        }

        const listDocument = await this.listDocumentRepository.findOne({
            where: {
                id_profile: profileId,
                id_required_documents: requiredDocumentId
            },
            relations: ['profile', 'requiredDocuments'],
        });
        if (!listDocument) {
            throw new NotFoundException(`No se encontró Relación entre perfil ${profileId} y documento ${requiredDocumentId}`);
        }

        const result = await this.listDocumentRepository.delete({
            id_profile: profileId,
            id_required_documents: requiredDocumentId
        });
        if (result.affected === 0) {
            throw new NotFoundException(`No se encontró Relación entre perfil ${profileId} y documento ${requiredDocumentId}`);
        }

        // Retornar estructura plana del elemento eliminado
        return {
            id_profile: listDocument.id_profile,
            profile_name: listDocument.profile.name,
            id_required_documents: listDocument.id_required_documents,
            name_required_documents: listDocument.requiredDocuments.name_required_documents
        };
    }
}
