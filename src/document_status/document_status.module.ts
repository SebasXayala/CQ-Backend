import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentStatusService } from './document_status.service';
import { DocumentStatusController } from './document_status.controller';
import { DocumentStatus } from './entities/document_status.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DocumentStatus])],
  controllers: [DocumentStatusController],
  providers: [DocumentStatusService],
  exports: [DocumentStatusService],
})
export class DocumentStatusModule { }
