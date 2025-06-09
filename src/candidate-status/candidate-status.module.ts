import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CandidateStatus } from './entities/candidate-status.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CandidateStatus])],
  exports: [TypeOrmModule],
})
export class CandidateStatusModule {}
