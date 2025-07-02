import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppService } from './app.service';
import { AppController } from './app.controller';
/* Import Module */
import { UsersModule } from './users/users.module';
import { RoleModule } from './role/roles.module';
import { AuthModule } from './auth/auth.module';
import { CandidateModule } from './candidate/candidate.module';
import { ProfileModule } from './profile/profile.module';
import { PositionModule } from './position/position.module';
import { SelectionProcessModule } from './selection_process/selection_process.module';
import { CandidateStatusModule } from './candidate_status/candidate_status.module';
import { RequiredDocumentsModule } from './required_documents/required_documents.module';
/* Import Entity */
import { User } from './users/entities/user.entity';
import { Role } from './role/entities/role.entity';
import { Candidate } from './candidate/entities/candidate.entity';
import { CandidateStatus } from './candidate_status/entities/candidate_status.entity';
import { Profile } from './profile/entities/profile.entity';
import { Position } from './position/entities/position.entity';
import { SelectionProcess } from './selection_process/entities/selection_process.entity';
import { RequiredDocuments } from './required_documents/entities/required_documents.entity';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        entities: [User, Role, Candidate, CandidateStatus, Profile, Position, SelectionProcess, RequiredDocuments],
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
    SelectionProcessModule,
    PositionModule,
    ProfileModule,
    RequiredDocumentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(private dataSource: DataSource) { }
  async onModuleInit() {
    try {
      console.log('✅ Conectado correctamente a la base de datos');
    } catch (error) {
      console.error('❌ Error al conectar a la base de datos:', error);
    }
  }
}
