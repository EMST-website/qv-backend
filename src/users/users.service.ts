import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '@/database/database.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@/database/schema';
import { eq } from 'drizzle-orm';
import { users } from './users.schema';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: NodePgDatabase<typeof schema>,
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
    const result = await this.db.insert(users).values(createUserDto).returning();
    return result[0];
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
}
