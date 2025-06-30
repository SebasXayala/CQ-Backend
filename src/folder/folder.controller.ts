import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { FolderService } from './folder.service';
import { CreateFolderDto } from './dto/create-Folder.dto';
import { UpdateFolderDto } from './dto/update-Folder.dto';

@Controller('folders')
export class FolderController {
  constructor(private readonly folderService: FolderService) {}

  @Post()
  create(@Body() dto: CreateFolderDto) {
    return this.folderService.create(dto);
  }

  @Get()
  findAll() {
    return this.folderService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.folderService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() dto: UpdateFolderDto) {
    return this.folderService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.folderService.remove(+id);
  }
}
