// src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async create(dto: CreateUserDto) {
    const user = this.userRepo.create(dto);
    return this.userRepo.save(user);
  }

  async findAll() {
    return this.userRepo.find({ relations: ['role'] });
  }

  async findOne(id: number) {
    return this.userRepo.findOne({ where: { id_user: id }, relations: ['role'] });
  }

  async update(id: number, dto: UpdateUserDto) {
    return this.userRepo.update({ id_user: id }, dto);
  }

  async remove(id: number) {
    return this.userRepo.delete({ id_user: id });
  }

  async findByEmail(email: string) {
    return this.userRepo.findOne({ where: { email }, relations: ['role'] });
  }
}
