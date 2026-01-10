import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '@/database/database.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@/database/schema';
// import { eq } from 'drizzle-orm';
// import { users } from './users.schema';
// import { EmailService } from '@/modules/1auth/email.service';
// import { v4 as uuidv4 } from 'uuid';
import { successResponse } from '@/common/utils/response/response';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
    // private readonly emailService: EmailService,
  ) {}

  findAll() {
    return (successResponse('Users fetched successfully', { users: [] }));
  }

  findOne() {
    return (successResponse('User fetched successfully', { user: {} }));
  }

  findByEmail() {
      return (successResponse('User fetched successfully', { user: {} }));
  }

  create() {
    // Generate activation token
    return (successResponse('User created successfully', { user: {} }));
  }

  update() {
    return (successResponse('User updated successfully', { user: {} }));
  }

  remove() {
    return (successResponse('User removed successfully'));
  }

  // Used by AuthController to activate user
  activateUser() {
    return (successResponse('User activated successfully', { user: {} }));
  }
}
