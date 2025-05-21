import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { RoleModule } from './role/roles.module';
import { AuthModule } from './auth/auth.module';
import { User } from './users/entities/user.entity';
import { Role } from './role/entities/role.entity';
import { DataSource } from 'typeorm';
import { CandidateModule } from './candidate/candidate.module';
import { CandidateStatusModule } from './candidate-status/candidate-status.module';
import { Candidate } from './candidate/entities/candidate.entity';
import { CandidateStatus } from './candidate-status/entities/candidate-status.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        entities: [User, Role, Candidate, CandidateStatus],
        autoLoadEntities: true,
        synchronize: false,
        ssl: { rejectUnauthorized: false },
      }),
    }),

    UsersModule,
    RoleModule,
    AuthModule,
    CandidateModule,
    CandidateStatusModule,
  ],
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
