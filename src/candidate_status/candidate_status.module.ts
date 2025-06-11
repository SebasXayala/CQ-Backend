import { Module } from '@nestjs/common';
import { CandidateStatusService } from './candidate_status.service';
import { CandidateStatusController } from './candidate_status.controller';

@Module({
  controllers: [CandidateStatusController],
  providers: [CandidateStatusService],
})
export class CandidateStatusModule {}
