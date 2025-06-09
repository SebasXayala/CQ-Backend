import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { RoleModule } from 'src/role/roles.module';
import { RolesService } from 'src/role/roles.service';

@Module({
  imports: [TypeOrmModule.forFeature([User]), RoleModule],
  providers: [UsersService, RolesService],
  controllers: [UsersController],
  exports: [UsersService]
})
export class UsersModule {}
