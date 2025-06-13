import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Position } from './entities/position.entity';
import { Repository } from 'typeorm';
import { constants } from 'buffer';

@Injectable()
export class PositionService {
  constructor(
    @InjectRepository(Position)
    private readonly positionRepository: Repository<Position>,
  ) { }
  
  async create(createPositionDto: CreatePositionDto) {
    const exists = await this.positionRepository.findOneBy({ name: createPositionDto.name });
    if (exists) {
      throw new ConflictException('Ya existe un Cargo con ese nombre');
    }
    const position = this.positionRepository.create(createPositionDto);
    return this.positionRepository.save(position);
  }

  async findAll(): Promise<Position[]> {
    return this.positionRepository.find();
  }

  async findOne(id: number): Promise<Position> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException('El id debe ser un número entero positivo');
    }
    const position = await this.positionRepository.findOneBy({ id_position: id });
    if (!position) {
      throw new NotFoundException(`No se encontró Cargo con id ${id}`);
    }
    return position;
  }

  async update(id: number, updatePositionDto: UpdatePositionDto): Promise<Position> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException('El id debe ser un número entero positivo');
    }
    const position = await this.positionRepository.findOneBy({ id_position: id });
    if (!position) {
      throw new NotFoundException(`No se encontró Cargo con id ${id}`);
    }
    if (updatePositionDto.name && updatePositionDto.name !== position.name) {
      const exists = await this.positionRepository.findOneBy({ name: updatePositionDto.name });
      if (exists) {
        throw new ConflictException('Ya existe un Cargo con ese nombre');
      }
    }

    await this.positionRepository.update(id, updatePositionDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<Position> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException('El id debe ser un número entero positivo');
    }
    const position = await this.positionRepository.findOne({
      where: { id_position: id },
      relations: ['candidates'],
    });
    if (!position) {
      throw new NotFoundException(`No se encontró Cargo con id ${id}`);
    }
    if (position.candidates && position.candidates.length > 0) {
      throw new ConflictException('No se puede eliminar el Cargo porque tiene candidatos asociados');
    }
    const result = await this.positionRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException(`No se encontró Cargo con id ${id}`);
    return position;
  }
}
