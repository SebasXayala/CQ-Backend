import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Candidate } from './entities/candidate.entity';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { CandidateStatus } from '../candidate_status/entities/candidate_status.entity';
import { Profile } from '../profile/entities/profile.entity';
import { Position } from '../position/entities/position.entity';
import { SelectionProcess } from '../selection_process/entities/selection_process.entity';

@Injectable()
export class CandidateService {
  constructor(
    @InjectRepository(Candidate)
    private readonly candidateRepository: Repository<Candidate>,
    @InjectRepository(CandidateStatus)
    private readonly candidateStatusRepository: Repository<CandidateStatus>,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    @InjectRepository(Position)
    private readonly positionRepository: Repository<Position>,
    @InjectRepository(SelectionProcess)
    private readonly selectionProcessRepository: Repository<SelectionProcess>,
  ) {}

  async create(createCandidateDto: CreateCandidateDto) {
    const { name, identifier, identifier_type, profile, candidate_status, position } = createCandidateDto;
    if (!name || !identifier || !identifier_type || !profile || !candidate_status || !position) {
      throw new BadRequestException('Todos los campos son obligatorios.');
    }
    // Validar unicidad de identifier
    const exists = await this.candidateRepository.findOne({ where: { identifier } });
    if (exists) {
      throw new BadRequestException('Ya existe un candidato con ese identificador.');
    }
    // Validar existencia de relaciones
    const profileEntity = await this.profileRepository.findOne({ where: { id_profile: profile } });
    if (!profileEntity) throw new NotFoundException('Perfil no encontrado.');
    const statusEntity = await this.candidateStatusRepository.findOne({ where: { id_candidate_status: candidate_status } });
    if (!statusEntity) throw new NotFoundException('Estado de candidato no encontrado.');
    const positionEntity = await this.positionRepository.findOne({ where: { id_position: position } });
    if (!positionEntity) throw new NotFoundException('Posición no encontrada.');
    // Crear proceso de selección con la fecha actual
    const selectionProcess = this.selectionProcessRepository.create({ start_date: new Date() });
    await this.selectionProcessRepository.save(selectionProcess);
    // Crear candidato y asociar el proceso de selección
    const candidate = this.candidateRepository.create({
      name,
      identifier,
      identifier_type,
      profile: profileEntity,
      candidate_status: statusEntity,
      position: positionEntity,
      selectionProcess: selectionProcess,
    });
    return await this.candidateRepository.save(candidate);
  }

  async findAll() {
    const results = await this.candidateRepository.find({ relations: ['profile', 'candidate_status', 'position', 'selectionProcess'] });
    if (!results || results.length === 0) {
      throw new NotFoundException('No se encontraron candidatos registrados.');
    }
    return results;
  }

  async findOne(id: number) {
    const candidate = await this.candidateRepository.findOne({ where: { id_candidate: id }, relations: ['profile', 'candidate_status', 'position', 'selectionProcess'] });
    if (!candidate) {
      throw new NotFoundException(`No se encontró el candidato con id ${id}`);
    }
    return candidate;
  }

  async update(id: number, updateCandidateDto: UpdateCandidateDto) {
    const candidate = await this.candidateRepository.findOne({ where: { id_candidate: id } });
    if (!candidate) {
      throw new NotFoundException(`No se encontró el candidato con id ${id}`);
    }
    if (updateCandidateDto.identifier) {
      // Validar unicidad de identifier si se cambia
      const exists = await this.candidateRepository.findOne({ where: { identifier: updateCandidateDto.identifier } });
      if (exists && exists.id_candidate !== id) {
        throw new BadRequestException('Ya existe un candidato con ese identificador.');
      }
    }
    // Validar relaciones si se actualizan
    if (updateCandidateDto.profile) {
      const profileEntity = await this.profileRepository.findOne({ where: { id_profile: updateCandidateDto.profile } });
      if (!profileEntity) throw new NotFoundException('Perfil no encontrado.');
      candidate.profile = profileEntity;
    }
    if (updateCandidateDto.candidate_status) {
      const statusEntity = await this.candidateStatusRepository.findOne({ where: { id_candidate_status: updateCandidateDto.candidate_status } });
      if (!statusEntity) throw new NotFoundException('Estado de candidato no encontrado.');
      candidate.candidate_status = statusEntity;
    }
    if (updateCandidateDto.position) {
      const positionEntity = await this.positionRepository.findOne({ where: { id_position: updateCandidateDto.position } });
      if (!positionEntity) throw new NotFoundException('Posición no encontrada.');
      candidate.position = positionEntity;
    }
    Object.assign(candidate, updateCandidateDto);
    return await this.candidateRepository.save(candidate);
  }

  async remove(id: number) {
    const candidate = await this.candidateRepository.findOne({ where: { id_candidate: id } });
    if (!candidate) {
      throw new NotFoundException(`No se encontró el candidato con id ${id}`);
    }
    await this.candidateRepository.remove(candidate);
    return { message: 'Candidato eliminado correctamente.' };
  }
}
