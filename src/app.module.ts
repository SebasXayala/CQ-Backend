import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { RoleModule } from './role/role.module';
import { User } from './users/entities/user.entity';
import { Role } from './role/entities/role.entity';
import { AuthModule } from './auth/auth.module';


@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      entities: [User, Role],
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'tabo022124',
      database: 'baseDatosCQGestionHumana',
      autoLoadEntities: true,
      synchronize: false, // Desactiva esto en producción
    }),
    UsersModule,
    RoleModule,
    AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {

  constructor(private dataSource: DataSource) {}
  async onModuleInit() {
    try {
      console.log('✅ Conectado correctamente a la base de datos');
    } catch (error) {
      console.error('❌ Error al conectar a la base de datos:', error);
    }
  }
}
