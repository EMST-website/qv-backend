import { Injectable } from '@nestjs/common';
import { UsersService } from '@/users/users.service';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async activateUser(token: string, body: any) {
    const { password, ...profileData } = body;
    return this.usersService.activateUser(token, password, profileData);
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && user.password === pass) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }
}
