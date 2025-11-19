import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UserJwtAuthGuard } from '../auth/guards/user-jwt-auth.guard';

@Controller('roles')
@UseGuards(UserJwtAuthGuard)
export class RoleController {
  constructor(private readonly RolesService: RolesService) { }

  @Post()
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.RolesService.create(createRoleDto);
  }

  @Get()
  findAll() {
    return this.RolesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.RolesService.findOne(Number(id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.RolesService.update(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.RolesService.remove(id);
  }
}
