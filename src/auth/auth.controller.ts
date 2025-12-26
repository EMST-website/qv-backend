import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('activate')
  async activate(@Body() body: any) {
    return this.authService.activateUser(body.token, body);
  }
}
