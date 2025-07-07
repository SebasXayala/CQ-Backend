// src/users/users.service.ts
import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RolesService } from 'src/role/roles.service';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly rolesService: RolesService,
  ) { }

  async create(createUserDto: CreateUserDto) {
    const exists = await this.userRepository.findOneBy({ email: createUserDto.email });
    if (exists) {
      throw new ConflictException('Ya existe un Usuario con ese email');
    }
    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  findByOneEmail(email: string) {
    return this.userRepository.findOneBy({ email });
  }

  findAll(): Promise<User[]> {
    return this.userRepository.find({ relations: ['role'] });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id_user: id }, relations: ['role'] });
    if (!user) {
      throw new NotFoundException(`No se encontró Usuario con id ${id}`);
    }
    return user;
  }

  async update(id: number, dto: UpdateUserDto): Promise<User> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException('El id debe ser un número entero positivo');
    }
    const user = await this.userRepository.findOne({ where: { id_user: id }, relations: ['role'] });
    if (!user) {
      throw new NotFoundException(`No se encontró Usuario con id ${id}`);
    }
    if (dto.email && dto.email !== user.email) {
      const exists = await this.userRepository.findOneBy({ email: dto.email });
      if (exists) {
        throw new ConflictException('Ya existe un Usuario con ese email');
      }
    }
    const role = await this.rolesService.findOne(dto.id_role);
    if (!role) throw new NotFoundException(`No se encontró Rol con id ${dto.id_role}`);
    await this.userRepository.update({ id_user: id }, dto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<User> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException('El id debe ser un número entero positivo');
    }
    const user = await this.userRepository.findOne({ where: { id_user: id }, relations: ['role'] });
    if (!user) throw new NotFoundException(`No se encontró Usuario con id ${id}`);
    const result = await this.userRepository.delete({ id_user: id });
    if (result.affected === 0) throw new NotFoundException(`No se encontró Usuario con id ${id}`);
    return user;
  }

  findByEmail(email: string) {
    return this.userRepository.findOne({ where: { email }, relations: ['role'] });
  }
}
