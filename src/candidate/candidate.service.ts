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
import { DocumentService } from '../document/document.service';

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
    private readonly documentService: DocumentService,
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
    const { name, identifier, identifier_type, email, phone, profile, position } = createCandidateDto;
    if (!name || !identifier || !identifier_type || !email || !phone || !profile || !position) {
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

    // Asignar automáticamente candidate_status = 1
    const statusEntity = await this.candidateStatusRepository.findOne({ where: { id_candidate_status: 1 } });
    if (!statusEntity) throw new NotFoundException('Estado de candidato por defecto (ID: 1) no encontrado.');

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
      id_candidate: savedCandidate.id_candidate, // Agregar el ID
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
      throw new NotFoundException(`No se encontró el candidato`);
    }
    return candidate;
  }

  async update(id: number, updateCandidateDto: UpdateCandidateDto) {
    const candidate = await this.candidateRepository.findOne({ where: { id_candidate: id } });
    if (!candidate) {
      throw new NotFoundException(`No se encontró el candidato`);
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
      throw new NotFoundException(`No se encontró el candidato`);
    }

    // Validar que el candidato no esté asociado a ninguna carpeta
    const folderRepo = this.dataSource.getRepository('folder');
    const folders = await folderRepo.find({ where: { id_candidate: id } });
    if (folders.length > 0) {
      throw new BadRequestException('No se puede eliminar el candidato porque está asociado a una o más carpetas.');
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
      relations: ['profile', 'candidate_status', 'position', 'selectionProcess', 'folder']
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

  /**
   * Cambiar el estado del candidato a id_candidate_status = 3 (Contratado)
   */
  async setStatusToHired(id_candidate: number): Promise<Candidate> {
    // Paso 1: Listar todos los folders relacionados al candidato
    const folderRepo = this.dataSource.getRepository('folder');
    const folders = await folderRepo.find({ where: { id_candidate } });
    if (!folders || folders.length === 0) {
      throw new NotFoundException('No se encontró folder para el candidato');
    }
    const folderId = folders[0].id_folder;
    // Buscar documentos por id_folder
    const documentRepo = this.dataSource.getRepository('documents');
    const documents = await documentRepo.find({
      where: { id_folder: folderId },
      relations: ['documentStatus']
    });
    const docsSimple = documents.map(doc => ({
      document_name: doc.document_name,
      id_document_status: doc.id_document_status
    }));

    // Validar que todos los documentos tengan id_document_status = 4
    const allAccepted = documents.length > 0 && documents.every(doc => doc.id_document_status === 4);

    // Buscar el candidato
    const candidate = await this.candidateRepository.findOne({ where: { id_candidate } });
    if (!candidate) {
      throw new NotFoundException(`No se encontró el candidato con id ${id_candidate}`);
    }

    let statusId = allAccepted ? 3 : 5;
    const status = await this.candidateStatusRepository.findOne({ where: { id_candidate_status: statusId } });
    if (!status) {
      throw new NotFoundException(`No se encontró el estado de candidato con id ${statusId}`);
    }

    candidate.candidate_status = status;
    return await this.candidateRepository.save(candidate);
  }

  /**
   * Cambiar el estado del candidato al candidate_status con id = 6
   */
  async setStatusToReview(id_candidate: number): Promise<Candidate> {
    if (!Number.isInteger(id_candidate) || id_candidate <= 0) {
      throw new BadRequestException('El id debe ser un número entero positivo');
    }

    const candidate = await this.candidateRepository.findOne({
      where: { id_candidate },
      relations: ['candidate_status', 'selectionProcess']
    });

    if (!candidate) {
      throw new NotFoundException(`No se encontró el candidato con id ${id_candidate}`);
    }

    // Buscar el candidate_status con id = 6
    const status = await this.candidateStatusRepository.findOne({
      where: { id_candidate_status: 6 }
    });

    if (!status) {
      throw new NotFoundException('No se encontró el estado de candidato');
    }

    // Asignar el nuevo estado
    candidate.candidate_status = status;

    // Guardar los cambios
    const updatedCandidate = await this.candidateRepository.save(candidate);

    return updatedCandidate;
  }

}
