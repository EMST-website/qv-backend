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

  findOne(id: string) {
    return (successResponse('User fetched successfully', { user: {}, id }));
  }

  findByEmail(email: string) {
      return (successResponse('User fetched successfully', { user: {}, email }));
  }

  create(body: any) {
    // Generate activation token
    return (successResponse('User created successfully', { user: {}, body }));
  }

  update(id: string, body: any) {
    return (successResponse('User updated successfully', { user: {}, id, body }));
  }

  remove(id: string) {
    return (successResponse('User removed successfully', { id }));
  }

  // Used by AuthController to activate user
  activateUser(body: any) {
    return (successResponse('User activated successfully', { user: {}, body }));
  }
}
