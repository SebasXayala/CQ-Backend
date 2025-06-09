import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { CandidateService } from './candidate.service';
import { Candidate } from './entities/candidate.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('candidate')
@UseGuards(JwtAuthGuard)
export class CandidateController {
  constructor(private readonly candidateService: CandidateService) {}

  @Post()
  create(@Body() candidate: Partial<Candidate>) {
    return this.candidateService.create(candidate);
  }

  @Get()
  findAll() {
    return this.candidateService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.candidateService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() updateData: Partial<Candidate>) {
    return this.candidateService.update(id, updateData);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.candidateService.remove(id);
  }
}
