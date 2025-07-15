import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { UserJwtAuthGuard } from './auth/guards/user-jwt-auth.guard';

@Controller()
@UseGuards(UserJwtAuthGuard)
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
