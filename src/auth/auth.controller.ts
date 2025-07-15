import { Controller, Post, Body, Headers, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { CandidateLoginDto } from './dto/candidate-login.dto';
import { UserJwtAuthGuard } from './guards/user-jwt-auth.guard';
import { CandidateJwtAuthGuard } from './guards/candidate-jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  async register(
    @Body()
    createUserDto: CreateUserDto,
  ) {
    return this.authService.register(createUserDto);
  }

  // ===== ENDPOINTS PARA USUARIOS =====
  @Post('user/login')
  async userLogin(
    @Body()
    loginDto: LoginDto,
  ) {
    return this.authService.login(loginDto);
  }

  @Post('user/logout')
  @UseGuards(UserJwtAuthGuard)
  async userLogout(
    @Request() req: any,
  ) {
    const jti = req.user?.jti;
    if (!jti) {
      throw new BadRequestException('Token inválido: JTI no encontrado');
    }
    return this.authService.userLogout(jti);
  }

  // ===== ENDPOINTS PARA CANDIDATOS =====
  @Post('candidate/login')
  async candidateLogin(
    @Body()
    candidateLoginDto: CandidateLoginDto,
  ) {
    return this.authService.candidateLogin(candidateLoginDto);
  }

  @Post('candidate/logout')
  @UseGuards(CandidateJwtAuthGuard)
  async candidateLogout(
    @Request() req: any,
  ) {
    const jti = req.user?.jti;
    if (!jti) {
      throw new BadRequestException('Token inválido: JTI no encontrado');
    }
    return this.authService.candidateLogout(jti);
  }
}
