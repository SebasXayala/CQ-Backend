import { Module } from '@nestjs/common';
import { DocumentStatusService } from './document_status.service';
import { DocumentStatusController } from './document_status.controller';

@Module({
  controllers: [DocumentStatusController],
  providers: [DocumentStatusService],
})
export class DocumentStatusModule {}
