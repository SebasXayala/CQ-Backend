import { Module } from '@nestjs/common';
import { CandidateStatusService } from './candidate_status.service';
import { CandidateStatusController } from './candidate_status.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CandidateStatus } from './entities/candidate_status.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CandidateStatus])],
  controllers: [CandidateStatusController],
  providers: [CandidateStatusService],
})
export class CandidateStatusModule {}