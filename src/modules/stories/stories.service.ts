import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Injectable, Inject, NotFoundException } from "@nestjs/common";
import { DATABASE_CONNECTION } from "@/database/database.provider";
import * as schema from "@/database/schema";
import { stories } from "./stories.schema";
import { eq, desc, like, and, count, inArray, or } from "drizzle-orm";
import { successResponse } from "@/common/utils/response/response";
import { UpdateStoryDto } from "./dto/update-story.dto";
import { users } from "../users/schema/users.schema";

@Injectable()
export class StoriesService {
   constructor(
      @Inject(DATABASE_CONNECTION)
      private readonly db: NodePgDatabase<typeof schema>,
   ) { }

   /**
    * Find all stories with pagination and filters
    * @param filters - The filters
    */
   public async findAll(filters: {
      page: number;
      limit: number;
      search?: string;
      organization_ids?: string[];
      user_ids?: string[];
   }) {
      const { page, limit, search, organization_ids, user_ids } = filters;
      const offset = (page - 1) * limit;

      // Build where conditions
      const where_conditions = and(
         ...(search ? [
            or(
               like(users.first_name, `%${search}%`),
               like(users.last_name, `%${search}%`)
            )
         ] : []),
         ...(organization_ids && organization_ids.length > 0 ? [inArray(users.organization_id, organization_ids)] : []),
         ...(user_ids && user_ids.length > 0 ? [inArray(stories.user_id, user_ids)] : []),
      );

      // Fetch stories and total count
      const [stories_db, total] = await Promise.all([
         this.db.query.stories.findMany({
            limit,
            offset,
            where: where_conditions,
            orderBy: [desc(stories.created_at)],
            with: {
               user: {
                  columns: {
                     id: true,
                     first_name: true,
                     last_name: true,
                     email: true,
                     image_url: true,
                     title: true,
                     organization_id: true,
                  }
               }
            }
         }),
         this.db.select({ count: count() })
            .from(stories)
            .leftJoin(users, eq(stories.user_id, users.id))
            .where(where_conditions)
            .then(result => result[0].count),
      ]);

      // Format response
      const result = {
         stories: stories_db,
         pagination: {
            total,
            total_pages: Math.ceil(total / limit),
            page,
            limit,
            has_next: page < Math.ceil(total / limit),
            has_previous: page > 1,
         }
      };

      // Return success response
      return successResponse('Stories fetched successfully', result);
   }

   /**
    * Find a single story by id
    * @param id - The story id
    */
   public async findOne(id: string) {
      // Fetch story
      const story_db = await this.db.query.stories.findFirst({
         where: eq(stories.id, id),
         with: {
            user: {
               columns: {
                  id: true,
                  first_name: true,
                  last_name: true,
                  email: true,
                  image_url: true,
                  title: true,
                  organization_id: true,
               }
            }
         }
      });

      // If story not found, throw an error
      if (!story_db) throw new NotFoundException('Story not found');

      // Return success response
      return successResponse('Story fetched successfully', story_db);
   }

   /**
    * Update a story (admin can only change status)
    * @param id - The story id
    * @param form - The form data (only status)
    */
   public async update(id: string, form: UpdateStoryDto) {
      // Check if story exists
      const existing_story = await this.db.query.stories.findFirst({
         where: eq(stories.id, id),
      });

      if (!existing_story) throw new NotFoundException('Story not found');

      // Update story (only status can be changed by admin)
      const updated_story = await this.db.update(stories)
         .set({
            status: form.status,
            updated_at: new Date(),
         })
         .where(eq(stories.id, id))
         .returning()
         .then(result => result[0]);

      // Return success response
      return successResponse('Story status updated successfully', updated_story);
   }

   /**
    * Remove a story
    * @param id - The story id
    */
   public async remove(id: string) {
      // Check if story exists
      const existing_story = await this.db.query.stories.findFirst({
         where: eq(stories.id, id),
      });

      if (!existing_story) throw new NotFoundException('Story not found');

      // Delete story
      await this.db.delete(stories).where(eq(stories.id, id));

      // Return success response
      return successResponse('Story deleted successfully');
   }
}
