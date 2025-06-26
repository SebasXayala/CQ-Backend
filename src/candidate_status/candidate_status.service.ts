import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateCandidateStatusDto } from './dto/create-candidate_status.dto';
import { UpdateCandidateStatusDto } from './dto/update-candidate_status.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CandidateStatus } from './entities/candidate_status.entity';
import { Repository } from 'typeorm/repository/Repository';

@Injectable()
export class CandidateStatusService {
  constructor(
    @InjectRepository(CandidateStatus)
    private readonly candidateStatusRepository: Repository<CandidateStatus>,
  ) {}

  async create(createCandidateStatusDto: CreateCandidateStatusDto) {
    const { status, description } = createCandidateStatusDto;
    // Validar unicidad de status
    const exists = await this.candidateStatusRepository.findOne({ where: { status } });
    if (exists) {
      throw new BadRequestException('Ya existe un estado de candidato con ese status.');
    }
    const candidateStatus = this.candidateStatusRepository.create({ status, description });
    return await this.candidateStatusRepository.save(candidateStatus);
  }

  async findAll() {
    const results = await this.candidateStatusRepository.find();
    if (!results || results.length === 0) {
      throw new NotFoundException('No se encontraron estados de candidato registrados.');
    }
    return results;
  }

  async findOne(id: number) {
    const candidateStatus = await this.candidateStatusRepository.findOne({ where: { id_candidate_status: id } });
    if (!candidateStatus) {
      throw new NotFoundException(`No se encontró el estado de candidato con id ${id}`);
    }
    return candidateStatus;
  }

  async update(id: number, updateCandidateStatusDto: UpdateCandidateStatusDto) {
    const candidateStatus = await this.candidateStatusRepository.findOne({ where: { id_candidate_status: id } });
    if (!candidateStatus) {
      throw new NotFoundException(`No se encontró el estado de candidato con id ${id}`);
    }
    if (updateCandidateStatusDto.status) {
      // Validar unicidad de status si se cambia
      const exists = await this.candidateStatusRepository.findOne({ where: { status: updateCandidateStatusDto.status } });
      if (exists && exists.id_candidate_status !== id) {
        throw new BadRequestException('Ya existe un estado de candidato con ese status.');
      }
    }
    Object.assign(candidateStatus, updateCandidateStatusDto);
    return await this.candidateStatusRepository.save(candidateStatus);
  }

  async remove(id: number) {
    const candidateStatus = await this.candidateStatusRepository.findOne({ where: { id_candidate_status: id } });
    if (!candidateStatus) {
      throw new NotFoundException(`No se encontró el estado de candidato con id ${id}`);
    }
    await this.candidateStatusRepository.remove(candidateStatus);
    return { message: 'Estado de candidato eliminado correctamente.' };
  }
}
