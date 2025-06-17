import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateSelectionProcessDto } from './dto/create-selection_process.dto';
import { UpdateSelectionProcessDto } from './dto/update-selection_process.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SelectionProcess } from './entities/selection_process.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SelectionProcessService {
  constructor(
    @InjectRepository(SelectionProcess)
    private readonly selectionProcessRepository: Repository<SelectionProcess>,
  ) {}
  
  async create(createSelectionProcessDto: CreateSelectionProcessDto) {
    const { start_date } = createSelectionProcessDto;
    const selectionProcess = this.selectionProcessRepository.create({
      start_date,
    });
    return await this.selectionProcessRepository.save(selectionProcess);
  }

  async findAll() {
    const results = await this.selectionProcessRepository.find();
    if (!results || results.length === 0) {
      throw new NotFoundException('No se encontraron procesos de selección registrados');
    }
    return results;
  }

  async findOne(id: number) {
    const selectionProcess = await this.selectionProcessRepository.findOne({ where: { id_process: id } });
    if (!selectionProcess) {
      throw new NotFoundException(`No se encontró el proceso de selección con id ${id}`);
    }
    return selectionProcess;
  }

  async update(id: number, updateSelectionProcessDto: UpdateSelectionProcessDto) {
    const selectionProcess = await this.selectionProcessRepository.findOne({ where: { id_process: id } });
    if (!selectionProcess) {
      throw new NotFoundException(`No se encontró el proceso de selección con id ${id}`);
    }
    if (updateSelectionProcessDto.end_date && new Date(updateSelectionProcessDto.end_date) <= new Date(selectionProcess.start_date)) {
      throw new BadRequestException('La fecha de finalización debe ser posterior a la de inicio.');
    }
    Object.assign(selectionProcess, updateSelectionProcessDto);
    return await this.selectionProcessRepository.save(selectionProcess);
  }

  async remove(id: number) {
    const selectionProcess = await this.selectionProcessRepository.findOne({ where: { id_process: id } });
    if (!selectionProcess) {
      throw new NotFoundException(`No se encontró el proceso de selección con id ${id}`);
    }
    await this.selectionProcessRepository.remove(selectionProcess);
    return { message: 'Proceso de selección eliminado correctamente.' };
  }
}
