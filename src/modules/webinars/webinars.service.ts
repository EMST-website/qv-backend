import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DATABASE_CONNECTION } from '@/database/database.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@/database/schema';
import { eq, sql, and, desc } from 'drizzle-orm';
import { webinars, webinarRegistrations } from './webinars.schema';
import { CreateWebinarDto } from './dto/create-webinar.dto';
import { UpdateWebinarDto } from './dto/update-webinar.dto';

@Injectable()
export class WebinarsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async create(createWebinarDto: CreateWebinarDto) {
    const newWebinar = await this.db
      .insert(webinars)
      .values({
        ...createWebinarDto,
        date: new Date(createWebinarDto.date),
        endDate: createWebinarDto.endDate
          ? new Date(createWebinarDto.endDate)
          : null,
      })
      .returning();
    return newWebinar[0];
  }

  async findAll(country?: string) {
    // Basic active filter
    const conditions = [eq(webinars.isActive, true)];

    // Add country filter if provided using raw SQL for array containment
    if (country) {
      // Postgres array contains operator @>
      conditions.push(
        sql`${webinars.countryAvailability} @> ARRAY[${country}]::text[]`,
      );
    }

    return this.db.query.webinars.findMany({
      where: and(...conditions),
      orderBy: [desc(webinars.date)],
      with: {
        registrations: true,
      },
    });
  }

  async findOne(id: string) {
    const webinar = await this.db.query.webinars.findFirst({
      where: eq(webinars.id, id),
      with: {
        registrations: true,
      },
    });
    if (!webinar) throw new NotFoundException('Webinar not found');
    return webinar;
  }

  async update(id: string, updateWebinarDto: UpdateWebinarDto) {
    await this.findOne(id); // Ensure exists

    const updated = await this.db
      .update(webinars)
      .set({
        ...updateWebinarDto,
        date: updateWebinarDto.date
          ? new Date(updateWebinarDto.date)
          : undefined,
        endDate: updateWebinarDto.endDate
          ? new Date(updateWebinarDto.endDate)
          : undefined,
        updatedAt: new Date(),
      })
      .where(eq(webinars.id, id))
      .returning();
    return updated[0];
  }

  async remove(id: string) {
    await this.findOne(id); // Ensure exists

    // Manual cascade delete
    await this.db
      .delete(webinarRegistrations)
      .where(eq(webinarRegistrations.webinarId, id));
    await this.db.delete(webinars).where(eq(webinars.id, id));
    return { success: true };
  }

  async register(webinarId: string, userId: string) {
    const webinar = await this.findOne(webinarId);

    // Check capacity
    if (webinar.capacity) {
      const result = await this.db
        .select({ count: sql<number>`count(*)` })
        .from(webinarRegistrations)
        .where(eq(webinarRegistrations.webinarId, webinarId));

      const currentCount = Number(result[0].count);
      if (currentCount >= webinar.capacity) {
        throw new BadRequestException('Webinar is full');
      }
    }

    // Check existing registration
    // Using simple select to avoid type issues with db.query helpers
    const existing = await this.db
      .select()
      .from(webinarRegistrations)
      .where(
        and(
          eq(webinarRegistrations.webinarId, webinarId),
          eq(webinarRegistrations.userId, userId),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      throw new BadRequestException('Already registered');
    }

    const registration = await this.db
      .insert(webinarRegistrations)
      .values({
        webinarId,
        userId,
      })
      .returning();

    return registration[0];
  }
}
