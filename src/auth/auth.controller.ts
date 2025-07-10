import { Controller, Post, Body, Headers, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { CandidateLoginDto } from './dto/candidate-login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

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

  @Post('login')
  async login(
    @Body()
    loginDto: LoginDto,
  ) {
    return this.authService.login(loginDto);
  }

  @Post('candidate_login')
  async candidateLogin(
    @Body()
    candidateLoginDto: CandidateLoginDto,
  ) {
    return this.authService.candidateLogin(candidateLoginDto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(
    @Headers('authorization') authorization: string,
  ) {
    if (!authorization) {
      throw new Error('Token de autorización requerido');
    }
    return this.authService.logout(authorization);
  }
}
