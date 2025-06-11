import { Module } from '@nestjs/common';
import { SelectionProcessService } from './selection_process.service';
import { SelectionProcessController } from './selection_process.controller';

@Module({
  controllers: [SelectionProcessController],
  providers: [SelectionProcessService],
})
export class SelectionProcessModule {}
