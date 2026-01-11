import { Injectable } from '@nestjs/common';
import { successResponse } from '@/common/utils/response/response';

@Injectable()
export class AuthService {
  constructor() {}

  activateUser(body: any) {
    return (successResponse('User activated successfully', { user: {}, body }));
  }

  validateUser(body: any) {
    return (successResponse('User validated successfully', { user: {}, body }));
  }
}
