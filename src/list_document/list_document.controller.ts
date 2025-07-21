import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ListDocumentService } from './list_document.service';
import { CreateListDocumentDto } from './dto/create-list_document.dto';
import { UpdateListDocumentDto } from './dto/update-list_document.dto';
import { CandidateJwtAuthGuard } from 'src/auth/guards/candidate-jwt-auth.guard';
import { UserJwtAuthGuard } from 'src/auth/guards/user-jwt-auth.guard';

@Controller('list_document')

export class ListDocumentController {
    constructor(private readonly listDocumentService: ListDocumentService) { }

    @UseGuards(UserJwtAuthGuard)
    @Post()
    create(@Body() createListDocumentDto: CreateListDocumentDto) {
        return this.listDocumentService.create(createListDocumentDto);
    }

    @UseGuards(UserJwtAuthGuard)
    @Get()
    findAll() {
        return this.listDocumentService.findAll();
    }

    @UseGuards(CandidateJwtAuthGuard)
    @Get('profile/:profileId')
    findByProfile(@Param('profileId', ParseIntPipe) profileId: number) {
        return this.listDocumentService.findByProfile(profileId);
    }

    @UseGuards(UserJwtAuthGuard)
    @Get(':profileId/:requiredDocumentId')
    findOne(@Param('profileId') profileId: string, @Param('requiredDocumentId') requiredDocumentId: string,) {
        return this.listDocumentService.findOne(+profileId, +requiredDocumentId);
    }

    @UseGuards(UserJwtAuthGuard)
    @Patch(':profileId/:requiredDocumentId')
    update(@Param('profileId') profileId: string, @Param('requiredDocumentId') requiredDocumentId: string, @Body() updateListDocumentDto: UpdateListDocumentDto,) {
        return this.listDocumentService.update(
            +profileId,
            +requiredDocumentId,
            updateListDocumentDto,
        );
    }

    @UseGuards(UserJwtAuthGuard)
    @Delete(':profileId/:requiredDocumentId')
    remove(@Param('profileId') profileId: string, @Param('requiredDocumentId') requiredDocumentId: string,) {
        return this.listDocumentService.remove(+profileId, +requiredDocumentId);
    }
}
