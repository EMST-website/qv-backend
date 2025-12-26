import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ActivateUserDto } from './dto/activate-user.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

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
}
