import { Injectable } from '@nestjs/common';
import { successResponse } from '@/common/utils/response/response';

@Injectable()
export class AuthService {
  constructor() {}

  activateUser() {
    return (successResponse('User activated successfully', { user: {} }));
  }

  validateUser() {
    return (successResponse('User validated successfully', { user: {} }));
  }
}
