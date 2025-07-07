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

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly candidateService: CandidateService,
    private readonly jwtService: JwtService,
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
}