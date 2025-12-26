import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '@/database/database.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@/database/schema';
import { eq } from 'drizzle-orm';
import { organizations } from './organizations.schema';

@Injectable()
export class OrganizationsService {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async findAll() {
    return this.db.query.organizations.findMany();
  }

  async findOne(id: string) {
    const result = await this.db.query.organizations.findFirst({
      where: eq(organizations.id, id),
    });
    return result;
  }

  async create(createOrganizationDto: any) {
    const result = await this.db.insert(organizations).values(createOrganizationDto).returning();
    return result[0];
  }

  async update(id: string, updateOrganizationDto: any) {
    const result = await this.db.update(organizations)
      .set(updateOrganizationDto)
      .where(eq(organizations.id, id))
      .returning();
    return result[0];
  }

  async remove(id: string) {
    await this.db.delete(organizations).where(eq(organizations.id, id));
    return { success: true };
  }
}
