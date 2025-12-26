import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '@/database/database.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@/database/schema';
import { eq } from 'drizzle-orm';
import { users } from './users.schema';
import { EmailService } from '@/auth/email.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: NodePgDatabase<typeof schema>,
    private readonly emailService: EmailService,
  ) {}

  async findAll() {
    return this.db.query.users.findMany({
      with: {
        organization: true,
      }
    });
  }

  async findOne(id: string) {
    const result = await this.db.query.users.findFirst({
      where: eq(users.id, id),
      with: {
        organization: true,
      }
    });
    return result;
  }

  async create(createUserDto: any) {
    // Generate activation token
    const activationToken = uuidv4();

    // Prepare user data (isActive = false, dummy password initially since they set it later)
    const userData = {
      ...createUserDto,
      isActive: false,
      activationToken,
      password: createUserDto.password || 'temp-password-placeholder', // In real app, make password nullable or handle simpler
    };

    const result = await this.db.insert(users).values(userData).returning();
    const newUser = result[0];

    // Send activation email
    await this.emailService.sendActivationEmail(newUser.email, activationToken);

    return newUser;
  }

  async update(id: string, updateUserDto: any) {
    const result = await this.db.update(users)
      .set(updateUserDto)
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async remove(id: string) {
    await this.db.delete(users).where(eq(users.id, id));
    return { success: true };
  }
  
  // Used by AuthController to activate user
  async activateUser(token: string, password: string, profileData: any) {
    const user = await this.db.query.users.findFirst({
      where: eq(users.activationToken, token),
    });

    if (!user) {
      throw new Error('Invalid activation token');
    }

    const updatedUser = await this.db.update(users)
      .set({
        isActive: true,
        activationToken: null, // Clear token
        password: password, // In real app, HASH THIS PASSWORD!
        ...profileData,
      })
      .where(eq(users.id, user.id))
      .returning();
      
    return updatedUser[0];
  }
}
