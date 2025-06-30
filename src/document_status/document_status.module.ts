import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentStatus } from './entities/document_status.entity';
import { DocumentStatusService } from './document_status.service';
import { DocumentStatusController } from './document_status.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DocumentStatus])],
  controllers: [DocumentStatusController],
  providers: [DocumentStatusService],
  exports: [DocumentStatusService,TypeOrmModule],
})
export class DocumentStatusModule {}
