import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CandidateService } from '../candidate/candidate.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { CandidateLoginDto } from './dto/candidate-login.dto';
import { LogoutResponseDto } from './dto/logout-response.dto';
import { JwtBlacklistService } from './jwt-blacklist.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly candidateService: CandidateService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly jwtBlacklistService: JwtBlacklistService,
  ) { }

  async register(createUserDto: CreateUserDto) {
    if (await this.usersService.findByOneEmail(createUserDto.email)) {
      throw new BadRequestException('User already exists');
    }
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.usersService.create({
      ...createUserDto,
      password: hashedPassword, // Aseguramos que el hash sobrescriba el valor original
    });
    return user;
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByOneEmail(loginDto.email);
    if (!user) {
      throw new BadGatewayException('Invalid email');
    }
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new BadGatewayException('Invalid password');
    }

    const jti = uuidv4();
    const payload = {
      sub: user.id_user,
      email: user.email,
      role: user.role.name,
      jti: jti,
      userType: 'user'
    };

    const token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET_USER'),
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN_USER') || '7d',
    });

    return {
      access_token: token,
      user: {
        id: user.id_user,
        email: user.email,
        role: user.id_role,
      },
    };
  }

  async candidateLogin(candidateLoginDto: CandidateLoginDto) {
    try {
      const candidate = await this.candidateService.findByEmail(candidateLoginDto.email);

      // Verificar la contraseña
      const isPasswordValid = await bcrypt.compare(
        candidateLoginDto.password,
        candidate.password
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException('Credenciales incorrectas.');
      }

      const jti = uuidv4();
      const payload = {
        sub: candidate.id_candidate,
        email: candidate.email,
        identifier: candidate.identifier,
        name: candidate.name,
        jti: jti,
        userType: 'candidate'
      };

      const token = this.jwtService.sign(payload, {
        secret: this.configService.get<string>('JWT_SECRET_CANDIDATE'),
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN_CANDIDATE') || '24h',
      });

      // Retornar información limpia sin la contraseña
      const { password, ...candidateData } = candidate;

      // Extraer el id_folder del primer folder asociado (si existe)
      const id_folder = candidate.folder && candidate.folder.length > 0 
        ? candidate.folder[0].id_folder 
        : null;

      return {
        access_token: token,
        candidate: {
          ...candidateData,
          id_folder: id_folder
        }
      };
    } catch (error) {
      throw new UnauthorizedException('Credenciales incorrectas. Verifique sus datos de acceso.');
    }
  }

  /**
   * Logout de usuario - invalida el token JWT
   * @param jti - JWT ID del token a invalidar
   * @returns mensaje de confirmación
   */
  async userLogout(jti: string): Promise<LogoutResponseDto> {
    try {
      // Agregar el JTI a la blacklist
      this.jwtBlacklistService.blacklistToken(jti, 'user');

      return new LogoutResponseDto('Logout de usuario exitoso');
    } catch (error) {
      throw new BadRequestException('Error al cerrar sesión');
    }
  }

  /**
   * Logout de candidato - invalida el token JWT
   * @param jti - JWT ID del token a invalidar
   * @returns mensaje de confirmación
   */
  async candidateLogout(jti: string): Promise<LogoutResponseDto> {
    try {
      // Agregar el JTI a la blacklist
      this.jwtBlacklistService.blacklistToken(jti, 'candidate');

      return new LogoutResponseDto('Logout de candidato exitoso');
    } catch (error) {
      throw new BadRequestException('Error al cerrar sesión');
    }
  }

  /**
   * Logout de usuario - invalida el token JWT (método legacy)
   * @param token - Token JWT a invalidar
   * @returns mensaje de confirmación
   */
  async logout(token: string): Promise<LogoutResponseDto> {
    try {
      // Remover el prefijo "Bearer " si existe
      const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;

      // Verificar que el token sea válido antes de agregarlo a la blacklist
      const decoded = this.jwtService.verify(cleanToken);

      // Verificar que sea un token de usuario (no de candidato)
      if (decoded.type === 'candidate') {
        throw new BadRequestException('Token de candidato no válido para logout de usuario');
      }

      // Agregar el token a la blacklist
      this.jwtBlacklistService.blacklistToken(cleanToken, 'user');

      return new LogoutResponseDto('Logout exitoso');
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return new LogoutResponseDto('Token ya expirado, logout exitoso');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new BadRequestException('Token inválido');
      }
      throw error;
    }
  }

  /**
   * Verifica si un token está en la blacklist
   * @param jti - JTI del token a verificar
   * @param userType - Tipo de usuario ('user' o 'candidate')
   * @returns true si está en blacklist, false si no
   */
  isTokenBlacklisted(jti: string, userType: 'user' | 'candidate'): boolean {
    return this.jwtBlacklistService.isTokenBlacklisted(jti, userType);
  }
}