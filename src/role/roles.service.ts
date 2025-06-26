import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) { }

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const exists = await this.roleRepository.findOneBy({ name: (createRoleDto as any).name });
    if (exists) {
      throw new ConflictException('Ya existe un rol con ese nombre');
    }
    const role = this.roleRepository.create(createRoleDto);
    return this.roleRepository.save(role);
  }

  async findAll(): Promise<Role[]> {
    return this.roleRepository.find();
  }

  async findOne(id: number): Promise<Role> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException('El id debe ser un número entero positivo');
    }
    const role = await this.roleRepository.findOneBy({ id_role: id });
    if (!role) throw new NotFoundException('No se encontró Rol con id ' + id);
    return role;
  }

  async update(id: number, updateRoleDto: UpdateRoleDto): Promise<Role> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException('El id debe ser un número entero positivo');
    }
    const role = await this.roleRepository.findOneBy({ id_role: id });
    if (!role) throw new NotFoundException('No se encontró Rol con id ' + id);
    // Validar unicidad si se actualiza el nombre
    if (updateRoleDto.name && updateRoleDto.name !== role.name) {
      const exists = await this.roleRepository.findOneBy({ name: updateRoleDto.name });
      if (exists) {
        throw new ConflictException('Ya existe un rol con ese nombre');
      }
    }
    await this.roleRepository.update(id, updateRoleDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<Role> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException('El id debe ser un número entero positivo');
    }
    const role = await this.roleRepository.findOne({
      where: { id_role: id },
      relations: ['users'],
    });
    if (!role) {
      throw new NotFoundException(`No se encontró Rol con id ${id}`);
    }
    if (Array.isArray(role.users) && role.users.length > 0) {
      throw new ConflictException('No se puede eliminar el rol porque está en uso por uno o más usuarios');
    }
    const result = await this.roleRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`No se encontró Rol con id ${id}`);
    }
    return role;
  }
}
