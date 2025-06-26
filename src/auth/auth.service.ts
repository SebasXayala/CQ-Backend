import {
  BadGatewayException,
  BadRequestException,
  Injectable,
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
    const candidate = await this.candidateService.findByIdentifier(candidateLoginDto.identifier);

    const payload = { identifier: candidate.identifier, type: 'candidate' };

    return {
      access_token: this.jwtService.sign(payload),
      candidate: {
        ...candidate,
        profile: candidate.profile && {
          id_profile: candidate.profile.id_profile,
          name: candidate.profile.name
        },
        candidate_status: candidate.candidate_status && {
          id_candidate_status: candidate.candidate_status.id_candidate_status,
          status: candidate.candidate_status.status,
          description: candidate.candidate_status.description
        },
        position: candidate.position && {
          id_position: candidate.position.id_position,
          name: candidate.position.name
        },
        selectionProcess: candidate.selectionProcess && {
          id_process: candidate.selectionProcess.id_process,
          start_date: candidate.selectionProcess.start_date,
          end_date: candidate.selectionProcess.end_date
        }
      },
    };
  }
}