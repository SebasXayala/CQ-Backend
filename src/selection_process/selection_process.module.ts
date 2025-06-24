import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SelectionProcessService } from './selection_process.service';
import { SelectionProcessController } from './selection_process.controller';
import { SelectionProcess } from './entities/selection_process.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SelectionProcess])],
  controllers: [SelectionProcessController],
  providers: [SelectionProcessService],
  exports: [TypeOrmModule, SelectionProcessService],
})
export class SelectionProcessModule { }
