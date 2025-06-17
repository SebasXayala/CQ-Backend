import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CandidateStatusService } from './candidate_status.service';
import { CreateCandidateStatusDto } from './dto/create-candidate_status.dto';
import { UpdateCandidateStatusDto } from './dto/update-candidate_status.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('candidate-status')
@UseGuards(JwtAuthGuard)
export class CandidateStatusController {
  constructor(private readonly candidateStatusService: CandidateStatusService) {}

  @Post()
  create(@Body() createCandidateStatusDto: CreateCandidateStatusDto) {
    return this.candidateStatusService.create(createCandidateStatusDto);
  }

  @Get()
  findAll() {
    return this.candidateStatusService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.candidateStatusService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCandidateStatusDto: UpdateCandidateStatusDto) {
    return this.candidateStatusService.update(+id, updateCandidateStatusDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.candidateStatusService.remove(+id);
  }
}
