import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() body: { email: string; password: string; id_role: number }) {
    return this.authService.register(body.email, body.password, body.id_role);
  }


  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      return { message: 'Credencialees incorrectas' };
    }
    return { message: 'Login exitoso', user }; 
  }
}
