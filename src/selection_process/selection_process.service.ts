import { Injectable } from '@nestjs/common';
import { CreateSelectionProcessDto } from './dto/create-selection_process.dto';
import { UpdateSelectionProcessDto } from './dto/update-selection_process.dto';

@Injectable()
export class SelectionProcessService {
  create(createSelectionProcessDto: CreateSelectionProcessDto) {
    return 'This action adds a new selectionProcess';
  }

  findAll() {
    return `This action returns all selectionProcess`;
  }

  findOne(id: number) {
    return `This action returns a #${id} selectionProcess`;
  }

  update(id: number, updateSelectionProcessDto: UpdateSelectionProcessDto) {
    return `This action updates a #${id} selectionProcess`;
  }

  remove(id: number) {
    return `This action removes a #${id} selectionProcess`;
  }
}
