import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Candidate } from './entities/candidate.entity';

@Injectable()
export class CandidateService {
  constructor(
    @InjectRepository(Candidate)
    private candidateRepository: Repository<Candidate>,
  ) {}

  create(candidate: Partial<Candidate>) {
    return this.candidateRepository.save(candidate);
  }

  findAll() {
    return this.candidateRepository.find({ relations: ['candidate_status'] });
  }

  findOne(id: number) {
    return this.candidateRepository.findOne({ where: { id_candidate: id }, relations: ['candidate_status'] });
  }

  update(id: number, updateData: Partial<Candidate>) {
    return this.candidateRepository.update(id, updateData);
  }

  remove(id: number) {
    return this.candidateRepository.delete(id);
  }
}
