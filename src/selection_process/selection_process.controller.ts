import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SelectionProcessService } from './selection_process.service';
import { CreateSelectionProcessDto } from './dto/create-selection_process.dto';
import { UpdateSelectionProcessDto } from './dto/update-selection_process.dto';

@Controller('selection-process')
export class SelectionProcessController {
  constructor(private readonly selectionProcessService: SelectionProcessService) {}

  @Post()
  create(@Body() createSelectionProcessDto: CreateSelectionProcessDto) {
    return this.selectionProcessService.create(createSelectionProcessDto);
  }

  @Get()
  findAll() {
    return this.selectionProcessService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.selectionProcessService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSelectionProcessDto: UpdateSelectionProcessDto) {
    return this.selectionProcessService.update(+id, updateSelectionProcessDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.selectionProcessService.remove(+id);
  }
}
