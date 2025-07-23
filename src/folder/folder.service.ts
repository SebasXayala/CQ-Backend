import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { Folder } from './entities/folder.entity';
import { CandidateService } from '../candidate/candidate.service';

@Injectable()
export class FolderService {
  constructor(
    @InjectRepository(Folder)
    private folderRepository: Repository<Folder>,
    private candidateService: CandidateService,
  ) { }


  async create(createFolderDto: CreateFolderDto): Promise<Folder> {
    try {
      let candidateId: number;
      let candidatePassword: string | undefined;
      let candidateIdentifier: string;


      if (createFolderDto.candidateData) {

        const createdCandidate = await this.candidateService.create(createFolderDto.candidateData);


        candidateId = createdCandidate.id_candidate;
        candidatePassword = createdCandidate.plainPassword;
        candidateIdentifier = createdCandidate.identifier;

      } else if (createFolderDto.id_candidate) {

        candidateId = createFolderDto.id_candidate;

        const candidate = await this.candidateService.findOne(candidateId);
        if (!candidate) {
          throw new BadRequestException(`El candidato no existe`);
        }
        candidateIdentifier = candidate.identifier; // Guardar el identifier del candidato existente
      } else {
        throw new BadRequestException('Debe proporcionar candidateData para crear un nuevo candidato o id_candidate para un candidato existente');
      }


      const existingFolder = await this.folderRepository.findOne({
        where: { id_candidate: candidateId },
      });

      if (existingFolder) {
        throw new ConflictException(`Ya existe una carpeta para el candidato con identificador ${candidateIdentifier}`);
      }

      const folder = this.folderRepository.create({
        id_candidate: candidateId,
        creation_date: new Date(),
        modification_date: new Date(),
      });

      const savedFolder = await this.folderRepository.save(folder);

      const response: any = {
        success: true,
        message: `Carpeta creada exitosamente para el candidato ${candidateIdentifier}`,
        data: {
          folder: {
            id_folder: savedFolder.id_folder,
            id_candidate: savedFolder.id_candidate,
            creation_date: savedFolder.creation_date,
            modification_date: savedFolder.modification_date
          }
        }
      };

      if (candidatePassword) {
        response.data.candidateCredentials = {
          password: candidatePassword,
          alert: "IMPORTANTE: Guarde esta contraseña temporal y comuníquesela al candidato",
          note: "Esta contraseña solo se mostrará una vez por seguridad"
        };
      }

      return response;

    } catch (error) {
      if (error instanceof BadRequestException || error instanceof ConflictException) {
        throw error;
      }

      if (error.code === '23503') {
        throw new BadRequestException(`Violación de restricción de base de datos`);
      }

      throw new BadRequestException(`Error al crear carpeta: ${error.message}`);
    }
  }

  async findAll(): Promise<Folder[]> {
    try {
      return await this.folderRepository.find({
        relations: ['candidate'],
        order: {
          creation_date: 'DESC',
        },
      });
    } catch (error) {
      throw new BadRequestException('Error al obtener carpetas');
    }
  }

  async findOne(id: number): Promise<Folder> {
    if (!id || id <= 0) {
      throw new BadRequestException('ID de carpeta inválido');
    }

    const folder = await this.folderRepository.findOne({
      where: { id_folder: id },
      relations: ['candidate'],
    });

    if (!folder) {
      throw new NotFoundException(`Carpeta con id ${id} no encontrada`);
    }

    return folder;
  }

  async findByCandidate(candidateId: number): Promise<Folder[]> {
    if (!candidateId || candidateId <= 0) {
      throw new BadRequestException('ID de candidato inválido');
    }

    try {
      return await this.folderRepository.find({
        where: { id_candidate: candidateId },
        relations: ['candidate'],
      });
    } catch (error) {
      throw new BadRequestException(`Error al buscar carpetas para el candidato ${candidateId}`);
    }
  }

  async update(id: number, updateFolderDto: UpdateFolderDto): Promise<Folder> {
    if (!id || id <= 0) {
      throw new BadRequestException('ID de carpeta inválido');
    }


    if (Object.keys(updateFolderDto).length === 0) {
      throw new BadRequestException('No se proporcionaron campos para actualizar');
    }

    const folder = await this.folderRepository.findOne({
      where: { id_folder: id },
    });

    if (!folder) {
      throw new NotFoundException(`Carpeta con id ${id} no encontrada`);
    }

    try {

      if (updateFolderDto.creation_date !== undefined) {
        const creationDate = new Date(updateFolderDto.creation_date);
        if (isNaN(creationDate.getTime())) {
          throw new BadRequestException('Formato de fecha de creación inválido');
        }
        folder.creation_date = creationDate;
      }

      if (updateFolderDto.modification_date !== undefined) {
        const modificationDate = new Date(updateFolderDto.modification_date);
        if (isNaN(modificationDate.getTime())) {
          throw new BadRequestException('Formato de fecha de modificación inválido');
        }
        folder.modification_date = modificationDate;
      }


      if (folder.modification_date < folder.creation_date) {
        throw new BadRequestException('La fecha de modificación no puede ser anterior a la fecha de creación');
      }

      if (updateFolderDto.id_candidate !== undefined) {

        const existingFolder = await this.folderRepository.findOne({
          where: { id_candidate: updateFolderDto.id_candidate },
        });

        if (existingFolder && existingFolder.id_folder !== id) {
          throw new ConflictException(`Ya existe una carpeta para este candidato`);
        }

        folder.id_candidate = updateFolderDto.id_candidate;
      }

      return await this.folderRepository.save(folder);
    } catch (error) {
      if (error.code === '23503') {
        throw new BadRequestException(`El candidato con id ${updateFolderDto.id_candidate} no existe`);
      }
      throw error;
    }
  }

  async remove(id: number): Promise<Folder> {
    if (!id || id <= 0) {
      throw new BadRequestException('ID de carpeta inválido');
    }

    const folder = await this.folderRepository.findOne({
      where: { id_folder: id },
    });

    if (!folder) {
      throw new NotFoundException(`Carpeta con id ${id} no encontrada`);
    }

    try {
      await this.folderRepository.delete(id);
      return folder;
    } catch (error) {
      if (error.code === '23503') {
        throw new ConflictException(`No se puede eliminar la carpeta con id ${id} porque tiene registros relacionados`);
      }
      throw new BadRequestException(`Error al eliminar carpeta con id ${id}`);
    }
  }
}
