import { Injectable } from '@nestjs/common';
import { UsersService } from '@/users/users.service';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async activateUser(token: string, body: any) {
    const { password, ...profileData } = body;
    return this.usersService.activateUser(token, password, profileData);
  }
}
