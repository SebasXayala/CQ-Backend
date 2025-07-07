import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ListDocumentService } from './list_document.service';
import { CreateListDocumentDto } from './dto/create-list_document.dto';
import { UpdateListDocumentDto } from './dto/update-list_document.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('list_document')
@UseGuards(JwtAuthGuard)
export class ListDocumentController {
    constructor(private readonly listDocumentService: ListDocumentService) { }

    @Post()
    create(@Body() createListDocumentDto: CreateListDocumentDto) {
        return this.listDocumentService.create(createListDocumentDto);
    }

    @Get()
    findAll() {
        return this.listDocumentService.findAll();
    }

    @Get('profile/:profileId')
    findByProfile(@Param('profileId', ParseIntPipe) profileId: number) {
        return this.listDocumentService.findByProfile(profileId);
    }

    @Get(':profileId/:requiredDocumentId')
    findOne(@Param('profileId') profileId: string, @Param('requiredDocumentId') requiredDocumentId: string,) {
        return this.listDocumentService.findOne(+profileId, +requiredDocumentId);
    }

    @Patch(':profileId/:requiredDocumentId')
    update(@Param('profileId') profileId: string, @Param('requiredDocumentId') requiredDocumentId: string, @Body() updateListDocumentDto: UpdateListDocumentDto,) {
        return this.listDocumentService.update(
            +profileId,
            +requiredDocumentId,
            updateListDocumentDto,
        );
    }

    @Delete(':profileId/:requiredDocumentId')
    remove(@Param('profileId') profileId: string, @Param('requiredDocumentId') requiredDocumentId: string,) {
        return this.listDocumentService.remove(+profileId, +requiredDocumentId);
    }
}
