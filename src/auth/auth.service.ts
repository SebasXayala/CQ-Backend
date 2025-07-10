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
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { CandidateLoginDto } from './dto/candidate-login.dto';
import { LogoutResponseDto } from './dto/logout-response.dto';
import { TokenBlacklistService } from './token-blacklist.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly candidateService: CandidateService,
    private readonly jwtService: JwtService,
    private readonly tokenBlacklistService: TokenBlacklistService,
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
    const payload = { email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
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

      const payload = {
        email: candidate.email,
        identifier: candidate.identifier,
        type: 'candidate'
      };

      // Retornar información limpia sin la contraseña
      const { password, ...candidateData } = candidate;

      return {
        access_token: this.jwtService.sign(payload),
        candidate: candidateData
      };
    } catch (error) {
      throw new UnauthorizedException('Credenciales incorrectas. Verifique sus datos de acceso.');
    }
  }

  /**
   * Logout de usuario - invalida el token JWT
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
      this.tokenBlacklistService.blacklistToken(cleanToken);

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
   * @param token - Token a verificar
   * @returns true si está en blacklist, false si no
   */
  isTokenBlacklisted(token: string): boolean {
    return this.tokenBlacklistService.isTokenBlacklisted(token);
  }
}