import { Injectable } from '@nestjs/common';
import { CreateCandidateStatusDto } from './dto/create-candidate_status.dto';
import { UpdateCandidateStatusDto } from './dto/update-candidate_status.dto';

@Injectable()
export class CandidateStatusService {
  create(createCandidateStatusDto: CreateCandidateStatusDto) {
    return 'This action adds a new candidateStatus';
  }

  findAll() {
    return `This action returns all candidateStatus`;
  }

  findOne(id: number) {
    return `This action returns a #${id} candidateStatus`;
  }

  update(id: number, updateCandidateStatusDto: UpdateCandidateStatusDto) {
    return `This action updates a #${id} candidateStatus`;
  }

  remove(id: number) {
    return `This action removes a #${id} candidateStatus`;
  }
}
