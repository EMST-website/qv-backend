import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ActivateUserDto } from './dto/activate-user.dto';
import { LoginDto } from './dto/login.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { UnauthorizedException } from '@nestjs/common';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('activate')
  @ApiOperation({ summary: 'Activate user account' })
  @ApiBody({ type: ActivateUserDto })
  @ApiResponse({ status: 200, description: 'User activated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid activation token or data' })
  async activate(@Body() body: ActivateUserDto) {
    return this.authService.activateUser(body.token, body);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() body: LoginDto) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }
}
