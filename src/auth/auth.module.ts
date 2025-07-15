import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { CandidateModule } from '../candidate/candidate.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtBlacklistService } from './jwt-blacklist.service';
import { UserJwtStrategy } from './strategies/user-jwt.strategy';
import { CandidateJwtStrategy } from './strategies/candidate-jwt.strategy';

@Module({
  imports: [
    UsersModule,
    CandidateModule,
    PassportModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        global: true,
        // Configuración base, los secretos específicos se manejan en las estrategias
        secret: configService.get<string>('JWT_SECRET_USER'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  providers: [
    AuthService,
    JwtBlacklistService,
    UserJwtStrategy,
    CandidateJwtStrategy,
  ],
  controllers: [AuthController],
  exports: [AuthService, JwtBlacklistService],
})
export class AuthModule { }
