import { Controller, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('verify')
  async verifyCode(@Query() param: { requestToken: string }) {
    return this.authService.verifyCode(param);
  }
}
