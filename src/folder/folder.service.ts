import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFolderDto } from './dto/create-Folder.dto';
import { Folder } from './entities/folder.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateFolderDto } from './dto/update-Folder.dto';

@Injectable()
export class FolderService {
 constructor(
    @InjectRepository(Folder)
    private readonly folderRepo: Repository<Folder>, 
  ) {}
async create(dto: CreateFolderDto): Promise<Folder> {
  const folder = this.folderRepo.create({
    id_candidate: dto.id_candidate,
    creation_date: new Date(dto.creation_date),
    modification_date: new Date(dto.modification_date),
  });
  return this.folderRepo.save(folder);
}
  async findAll(): Promise<Folder[]> {
    return this.folderRepo.find({ relations: ['documents'] });
  }

  async findOne(id: number): Promise<Folder> {
    const folder = await this.folderRepo.findOne({
      where: { id_folder: id },
      relations: ['documents'],
    });
    if (!folder) throw new NotFoundException('Folder not found');
    return folder;
  }

  async update(id: number, dto: UpdateFolderDto): Promise<Folder> {
    const folder = await this.findOne(id);
    Object.assign(folder, {
      ...dto,
      creation_date: dto.creation_date ? new Date(dto.creation_date) : folder.creation_date,
      modification_date: dto.modification_date ? new Date(dto.modification_date) : folder.modification_date,
    });
    return this.folderRepo.save(folder);
  }

  async remove(id: number): Promise<void> {
    const folder = await this.findOne(id);
    await this.folderRepo.remove(folder);
  }

}

