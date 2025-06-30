import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Folder } from './entities/folder.entity';
import { FolderService } from './folder.service';
import { FolderController } from './folder.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Folder])], // Importa la entidad para el repositorio
  controllers: [FolderController],
  providers: [FolderService],
  exports: [FolderService], // Exportas si otro módulo lo necesita
})
export class FolderModule {}
