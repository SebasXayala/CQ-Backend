import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { RequiredDocumentsService } from './required_documents.service';
import { CreateRequiredDocumentsDto } from './dto/create-required_documents.dto';
import { UpdateRequiredDocumentsDto } from './dto/update-required_documents.dto';
import { UserJwtAuthGuard } from 'src/auth/guards/user-jwt-auth.guard';

@Controller('required-documents')
@UseGuards(UserJwtAuthGuard)
export class RequiredDocumentsController {
    constructor(private readonly requiredDocumentsService: RequiredDocumentsService) { }

    @Post()
    create(@Body() createRequiredDocumentsDto: CreateRequiredDocumentsDto) {
        return this.requiredDocumentsService.create(createRequiredDocumentsDto);
    }

    @Get()
    findAll() {
        return this.requiredDocumentsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.requiredDocumentsService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateRequiredDocumentsDto: UpdateRequiredDocumentsDto) {
        return this.requiredDocumentsService.update(+id, updateRequiredDocumentsDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.requiredDocumentsService.remove(+id);
    }
}
