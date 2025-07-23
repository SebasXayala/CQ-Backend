import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateListDocumentDto } from './dto/create-list_document.dto';
import { UpdateListDocumentDto } from './dto/update-list_document.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

    async create(createListDocumentDto: CreateListDocumentDto) {
        // Validar que el perfil exista
        const profile = await this.profileRepository.findOneBy({ id_profile: createListDocumentDto.id_profile });
        if (!profile) {
            throw new NotFoundException(`No se encontró Perfil con id ${createListDocumentDto.id_profile}`);
        }

        // Validar que el documento requerido exista
        const requiredDocument = await this.requiredDocumentsRepository.findOneBy({
            id_required_documents: createListDocumentDto.id_required_documents
        });
        if (!requiredDocument) {
            throw new NotFoundException(`No se encontró Documento Requerido con id ${createListDocumentDto.id_required_documents}`);
        }

        // Validar que no exista ya la relación (llave primaria compuesta)
        const existingRelation = await this.listDocumentRepository.findOne({
            where: {
                id_profile: createListDocumentDto.id_profile,
                id_required_documents: createListDocumentDto.id_required_documents
            }
        });
        if (existingRelation) {
            throw new BadRequestException(`Ya existe una relación entre el Perfil ${createListDocumentDto.id_profile} y el Documento ${createListDocumentDto.id_required_documents}`);
        }

        const listDocument = this.listDocumentRepository.create(createListDocumentDto);
        const savedDocument = await this.listDocumentRepository.save(listDocument);

        // Retornar estructura plana
        return {
            id_profile: savedDocument.id_profile,
            profile_name: profile.name,
            id_required_documents: savedDocument.id_required_documents,
            name_required_documents: requiredDocument.name_required_documents
        };
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

    async update(profileId: number, requiredDocumentId: number, updateListDocumentDto: UpdateListDocumentDto) {
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
            }
        });
        if (!listDocument) {
            throw new NotFoundException(`No se encontró Relación entre perfil ${profileId} y documento ${requiredDocumentId}`);
        }

        // Validar que el perfil exista si se actualiza
        if (updateListDocumentDto.id_profile) {
            const profile = await this.profileRepository.findOneBy({ id_profile: updateListDocumentDto.id_profile });
            if (!profile) {
                throw new NotFoundException(`No se encontró Perfil con id ${updateListDocumentDto.id_profile}`);
            }
        }

        // Validar que el documento requerido exista si se actualiza
        if (updateListDocumentDto.id_required_documents) {
            const requiredDocument = await this.requiredDocumentsRepository.findOneBy({
                id_required_documents: updateListDocumentDto.id_required_documents
            });
            if (!requiredDocument) {
                throw new NotFoundException(`No se encontró Documento Requerido con id ${updateListDocumentDto.id_required_documents}`);
            }
        }

        // Validar que no exista ya la relación con los nuevos valores (solo si se están actualizando)
        const newProfileId = updateListDocumentDto.id_profile || profileId;
        const newRequiredDocumentId = updateListDocumentDto.id_required_documents || requiredDocumentId;

        // Solo validar si los valores nuevos son diferentes a los actuales
        if (newProfileId !== profileId || newRequiredDocumentId !== requiredDocumentId) {
            const existingRelation = await this.listDocumentRepository.findOne({
                where: {
                    id_profile: newProfileId,
                    id_required_documents: newRequiredDocumentId
                }
            });
            if (existingRelation) {
                // Obtener los nombres para el mensaje de error
                const profileForError = await this.profileRepository.findOneBy({ id_profile: newProfileId });
                const requiredDocumentForError = await this.requiredDocumentsRepository.findOneBy({
                    id_required_documents: newRequiredDocumentId
                });

                const profileName = profileForError?.name || `ID ${newProfileId}`;
                const documentName = requiredDocumentForError?.name_required_documents || `ID ${newRequiredDocumentId}`;

                throw new BadRequestException(`Ya está asignado el documento "${documentName}" al perfil "${profileName}"`);
            }
        }

        await this.listDocumentRepository.update({
            id_profile: profileId,
            id_required_documents: requiredDocumentId
        }, updateListDocumentDto);

        return this.findOne(
            updateListDocumentDto.id_profile || profileId,
            updateListDocumentDto.id_required_documents || requiredDocumentId
        );
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
