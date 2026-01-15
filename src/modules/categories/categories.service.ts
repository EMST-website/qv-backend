import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Injectable, Inject, BadRequestException, NotFoundException } from "@nestjs/common";
import { DATABASE_CONNECTION } from "@/database/database.provider";
import * as schema from "@/database/schema";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { MediaService } from "@/common/utils/media/media.service";
import { categories } from "@/database/schema";
import { successResponse } from "@/common/utils/response/response";
import { and, asc, count, eq, like } from "drizzle-orm";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { REDIS_CLIENT } from "@/cache/cache.service";
import { Redis } from "ioredis";

@Injectable()
export class CategoriesService {
   constructor(
      @Inject(DATABASE_CONNECTION)
      private readonly db: NodePgDatabase<typeof schema>,
      @Inject(REDIS_CLIENT)
      private readonly redis: Redis,
      private readonly media_service: MediaService,
   ) { }

   public async create(form: CreateCategoryDto, file: Express.Multer.File) {
      if (!file) throw new BadRequestException('Image is required');
      // upload image to cloudinary
      const image_url = await this.media_service.uploadImage(file.path);
      if (!image_url.secure_url) throw new BadRequestException('Failed to upload image');
      // create category
      const category = await this.db.insert(categories).values({
         title: form.title,
         image_url: image_url.secure_url,
         status: form.status,
      }).returning().then(result => result[0]);

      // set list to cache
      await this.redis.del('categories_list');

      // return success response
      return (successResponse('Category created successfully', category));
   };

   public async findAll(filters: {
      page: number;
      limit: number;
      search?: string;
   }) {
      const { page, limit, search } = filters;
      const [categories_list, total] = await Promise.all([
         this.db.query.categories.findMany({
            where: and(
               ...(search ? [like(categories.title, `%${search}%`)] : []),
            ),
            offset: (page - 1) * limit,
            limit,
            orderBy: [asc(categories.title)],
         }),
         this.db.select({ count: count() }).from(categories).where(and(
            ...(search ? [like(categories.title, `%${search}%`)] : []),
         )).then(result => result[0].count),
      ]);

      // prepare the result
      const result = {
         categories: categories_list,
         pagination: {
            total,
            current_page: page,
            total_pages: Math.ceil(total / limit),
            has_next_page: page < Math.ceil(total / limit),
            has_previous_page: page > 1,
         },
      };
      return (successResponse('Categories fetched successfully', result));
   };

   public async findOne(id: string) {
      const category = await this.db.query.categories.findFirst({
         where: eq(categories.id, id),
      });
      if (!category) throw new NotFoundException('Category not found');
      return (successResponse('Category fetched successfully', category));
   };

   public async update(id: string, form: UpdateCategoryDto, file: Express.Multer.File | undefined) {
      let image_url: string | null = '';
      // upload image to cloudinary if file is provided
      if (file) {
         const image = await this.media_service.uploadImage(file.path);
         if (!image.secure_url) throw new BadRequestException('Failed to upload image');
         image_url = image.secure_url;
      };

      // update category
      const category = await this.db.update(categories).set({
         title: form.title,
         status: form.status,
         image_url: image_url ? image_url : undefined,
      }).where(eq(categories.id, id)).returning().then(result => result[0]);

      // delete from cache
      await this.redis.del('categories_list');

      // return success response
      return (successResponse('Category updated successfully', category));
   };

   public async delete(id: string) {
      const category = await this.findOne(id);
      if (!category) throw new NotFoundException('Category not found');

      // delete image from cloudinary if image_url is provided
      if (category.data?.image_url) {
         try {
            await this.media_service.deleteImage(category.data.image_url);
         } catch (error: any) {
            console.error('Error deleting image:', error);
         }
      };
      // delete category
      await this.db.delete(categories).where(eq(categories.id, id));

      // delete from cache
      await this.redis.del('categories_list');

      // return success response
      return (successResponse('Category deleted successfully', category));
   };

   public async list() {
      // get list from cache
      const categories_cache = await this.redis.get('categories_list');
      if (categories_cache)
         return (successResponse('Categories list fetched successfully', JSON.parse(categories_cache)));

      // get list from database
      const categories_db = await this.db.query.categories.findMany({
         where: eq(categories.status, 'ACTIVE'),
         orderBy: [asc(categories.title)],
         columns: {
            id: true,
            title: true,
         },
      });

      // set list to cache
      await this.redis.set('categories_list', JSON.stringify(categories_db));

      // return success response
      return (successResponse('Categories list fetched successfully', categories_db));
   };
};
