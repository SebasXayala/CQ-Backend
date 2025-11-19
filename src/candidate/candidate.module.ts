import { Document } from '../document/entities/document.entity';
import { Module } from '@nestjs/common';
import { CandidateService } from './candidate.service';
import { CandidateController } from './candidate.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Candidate } from './entities/candidate.entity';
import { CandidateStatusModule } from 'src/candidate_status/candidate_status.module';
import { PositionModule } from 'src/position/position.module';
import { ProfileModule } from 'src/profile/profile.module';
import { CandidateStatus } from 'src/candidate_status/entities/candidate_status.entity';
import { CandidateStatusService } from 'src/candidate_status/candidate_status.service';
import { CandidateStatusController } from 'src/candidate_status/candidate_status.controller';
import { SelectionProcess } from 'src/selection_process/entities/selection_process.entity';
import { DocumentModule } from 'src/document/document.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Candidate, CandidateStatus, SelectionProcess, Document]),
    ProfileModule,
    PositionModule,
    CandidateStatusModule,
    DocumentModule
  ],
  controllers: [CandidateController, CandidateStatusController],
  providers: [CandidateService, CandidateStatusService],
  exports: [CandidateService],
})
export class CandidateModule { }
