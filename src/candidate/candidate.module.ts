import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Candidate } from './entities/candidate.entity';
import { CandidateService } from './candidate.service';
import { CandidateController } from './candidate.controller';
import { CandidateStatus } from '../candidate-status/entities/candidate-status.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Candidate, CandidateStatus])],
  controllers: [CandidateController],
  providers: [CandidateService],
  exports: [CandidateService],
})
export class CandidateModule {}
