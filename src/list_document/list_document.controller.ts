import { Controller, Get, Body, Param, Delete, UseGuards, ParseIntPipe, Put } from '@nestjs/common';
import { ListDocumentService } from './list_document.service';
import { ReplaceProfileDocumentsDto } from './dto/replace-profile-documents.dto';
import { CandidateJwtAuthGuard } from 'src/auth/guards/candidate-jwt-auth.guard';
import { UserJwtAuthGuard } from 'src/auth/guards/user-jwt-auth.guard';

@Controller('list_document')

export class ListDocumentController {
    constructor(private readonly listDocumentService: ListDocumentService) { }

    @UseGuards(UserJwtAuthGuard)
    @Put('profile/:profileId')
    replaceProfileDocuments(
        @Param('profileId', ParseIntPipe) profileId: number,
        @Body() replaceDto: ReplaceProfileDocumentsDto
    ) {
        return this.listDocumentService.replaceProfileDocuments(profileId, replaceDto);
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
    @Delete(':profileId/:requiredDocumentId')
    remove(@Param('profileId') profileId: string, @Param('requiredDocumentId') requiredDocumentId: string,) {
        return this.listDocumentService.remove(+profileId, +requiredDocumentId);
    }
}
