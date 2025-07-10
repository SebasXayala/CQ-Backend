import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
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
    private readonly dataSource: DataSource,
  ) { }

  private generateRandomPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  async create(createCandidateDto: CreateCandidateDto) {
    const { name, identifier, identifier_type, email, phone, profile, candidate_status, position } = createCandidateDto;
    if (!name || !identifier || !identifier_type || !email || !phone || !profile || !candidate_status || !position) {
      throw new BadRequestException('Todos los campos son obligatorios.');
    }
    // Validar unicidad de identifier
    const exists = await this.candidateRepository.findOne({ where: { identifier } });
    if (exists) {
      throw new BadRequestException('Ya existe un candidato con ese identificador.');
    }

    // Validar unicidad de email
    const emailExists = await this.candidateRepository.findOne({ where: { email } });
    if (emailExists) {
      throw new BadRequestException('Ya existe un candidato con ese email.');
    }

    // Generar contraseña aleatoria
    const plainPassword = this.generateRandomPassword();
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

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
      email,
      phone,
      password: hashedPassword,
      profile: profileEntity,
      candidate_status: statusEntity,
      position: positionEntity,
      selectionProcess: selectionProcess,
    });

    const savedCandidate = await this.candidateRepository.save(candidate);

    // Retornar información limpia sin exponer la contraseña encriptada
    return {
      name: savedCandidate.name,
      identifier: savedCandidate.identifier,
      email: savedCandidate.email,
      phone: savedCandidate.phone,
      plainPassword: plainPassword, // Contraseña temporal para mostrar al admin
      message: "Candidato creado exitosamente. Guarde la contraseña temporal para comunicársela al candidato."
    };
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
    
    // Hash de la contraseña si se proporciona
    if (updateCandidateDto.password) {
      updateCandidateDto.password = await bcrypt.hash(updateCandidateDto.password, 10);
    }
    
    Object.assign(candidate, updateCandidateDto);
    return await this.candidateRepository.save(candidate);
  }

  async remove(id: number) {
    const candidate = await this.candidateRepository.findOne({
      where: { id_candidate: id },
      relations: ['selectionProcess']
    });
    if (!candidate) {
      throw new NotFoundException(`No se encontró el candidato con id ${id}`);
    }

    // Usar transacción para eliminar ambos registros atómicamente
    await this.dataSource.transaction(async manager => {
      // Primero eliminar el candidato
      await manager.remove(Candidate, candidate);

      // Luego eliminar el proceso de selección asociado si existe
      if (candidate.selectionProcess) {
        await manager.remove(SelectionProcess, candidate.selectionProcess);
      }
    });

    return { message: 'Candidato y proceso de selección eliminados correctamente.' };
  }

  async findByIdentifier(identifier: string) {
    const candidate = await this.candidateRepository.findOne({
      where: { identifier },
      relations: ['profile', 'candidate_status', 'position', 'selectionProcess']
    });
    if (!candidate) {
      throw new NotFoundException(`No se encontró el candidato con identificador ${identifier}`);
    }
    return candidate;
  }

  async findByEmail(email: string) {
    const candidate = await this.candidateRepository.findOne({
      where: { email },
      relations: ['profile', 'candidate_status', 'position', 'selectionProcess']
    });
    if (!candidate) {
      throw new NotFoundException(`No se encontró el candidato con email ${email}`);
    }
    return candidate;
  }

  async findByEmailAndIdentifier(email: string, identifier: string) {
    const candidate = await this.candidateRepository.findOne({
      where: { email, identifier },
      relations: ['profile', 'candidate_status', 'position', 'selectionProcess']
    });
    if (!candidate) {
      throw new NotFoundException(`Credenciales incorrectas. Verifique email e identificador.`);
    }
    return candidate;
  }
}
