import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from './entities/profile.entity';
import { ListDocument } from 'src/list_document/entities/list_document.entity';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    @InjectRepository(ListDocument)
    private readonly listDocumentRepository: Repository<ListDocument>,
  ) { }

  async create(createProfileDto: CreateProfileDto) {
    const exists = await this.profileRepository.findOneBy({ name: (createProfileDto as any).name });
    if (exists) {
      throw new ConflictException('Ya existe un perfil con ese nombre');
    }
    const profile = this.profileRepository.create(createProfileDto);
    return this.profileRepository.save(profile);
  }

  async findAll(): Promise<Profile[]> {
    return this.profileRepository.find();
  }

  async findOne(id: number): Promise<Profile> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException('El id debe ser un número entero positivo');
    }
    const profile = await this.profileRepository.findOneBy({ id_profile: id });
    if (!profile) {
      throw new NotFoundException(`No se encontró Perfil`);
    }
    return profile;
  }

  async update(id: number, updateProfileDto: UpdateProfileDto): Promise<Profile> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException('El id debe ser un número entero positivo');
    }
    const profile = await this.profileRepository.findOneBy({ id_profile: id });
    if (!profile) {
      throw new NotFoundException(`No se encontró Perfil`);
    }
    // Validar unicidad si se actualiza el nombre
    if (updateProfileDto.name && updateProfileDto.name !== profile.name) {
      const exists = await this.profileRepository.findOneBy({ name: updateProfileDto.name });
      if (exists) {
        throw new ConflictException('Ya existe un perfil con ese nombre');
      }
    }
    await this.profileRepository.update(id, updateProfileDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<Profile> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException('El id debe ser un número entero positivo');
    }
    const profile = await this.profileRepository.findOne({
      where: { id_profile: id },
      relations: ['candidates'],
    });
    if (!profile) {
      throw new NotFoundException(`No se encontró Perfil`);
    }

    // Verificar si tiene candidatos asociados
    if (profile.candidates && profile.candidates.length > 0) {
      throw new ConflictException('No se puede eliminar el Perfil porque tiene candidatos asociados');
    }

    // Verificar si está siendo utilizado en list_document
    const listDocumentCount = await this.listDocumentRepository.count({
      where: { id_profile: id }
    });
    if (listDocumentCount > 0) {
      throw new ConflictException(
        `No se puede eliminar el Perfil porque tiene documentos asociados en la lista de documentos. Elimine primero las referencias en la tabla de lista de documentos.`
      );
    }

    const result = await this.profileRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`No se encontró Perfil`);
    }
    return profile;
  }
}
