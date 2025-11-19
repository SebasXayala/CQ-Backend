import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CandidateService } from './candidate.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { UserJwtAuthGuard } from 'src/auth/guards/user-jwt-auth.guard';
import { CandidateJwtAuthGuard } from 'src/auth/guards/candidate-jwt-auth.guard';

@Controller('candidate')

export class CandidateController {

  constructor(private readonly candidateService: CandidateService) { }

  @UseGuards(UserJwtAuthGuard)
  @Post()
  create(@Body() createCandidateDto: CreateCandidateDto) {
    return this.candidateService.create(createCandidateDto);
  }

  @UseGuards(UserJwtAuthGuard)
  @Get()
  findAll() {
    return this.candidateService.findAll();
  }

  @UseGuards(UserJwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.candidateService.findOne(+id);
  }

  @UseGuards(UserJwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCandidateDto: UpdateCandidateDto) {
    return this.candidateService.update(+id, updateCandidateDto);
  }

  @UseGuards(UserJwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.candidateService.remove(+id);
  }

  @UseGuards(UserJwtAuthGuard)
  @Patch(':id/status-to-hired')
  async setStatusToHired(@Param('id') id: string) {
    return this.candidateService.setStatusToHired(+id);
  }

  @UseGuards(CandidateJwtAuthGuard)
  @Patch(':id/status-review')
  async setStatusToReview(@Param('id') id: string) {
    return this.candidateService.setStatusToReview(+id);
  }
}
