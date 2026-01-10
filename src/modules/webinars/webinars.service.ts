import {
  Injectable,
  Inject,
} from '@nestjs/common';
import { DATABASE_CONNECTION } from '@/database/database.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@/database/schema';
// import { webinars, webinarRegistrations } from './webinars.schema';
import { successResponse } from '@/common/utils/response/response';

@Injectable()
export class WebinarsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  create() {
    return (successResponse('Webinar created successfully', { webinar: {} }));
  }

  findAll() {
    // Basic active filter
    return (successResponse('Webinars fetched successfully', { webinars: [] }));
  }

  findOne() {
    return (successResponse('Webinar fetched successfully', { webinar: {} }));
  }

  update() {
    return (successResponse('Webinar updated successfully', { webinar: {} }));
  }

  remove() {
    return (successResponse('Webinar removed successfully'));
  }

  register() {
    return (successResponse('Webinar registered successfully', { webinar: {} }));
  }
}
