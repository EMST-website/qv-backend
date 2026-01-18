import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Injectable, Inject, BadRequestException, NotFoundException } from "@nestjs/common";
import { DATABASE_CONNECTION } from "@/database/database.provider";
import * as schema from "@/database/schema";
import { ArticleFileType, ArticleFileTypeEnum, articles, ArticleStatusEnum } from "./articles.schema";
import { eq, desc, and, count, ilike } from "drizzle-orm";
import { successResponse } from "@/common/utils/response/response";
import { CreateArticleDto } from "./dto/create-article.dto";
import { UpdateArticleDto } from "./dto/update-article.dto";
import { MediaService } from "@/common/utils/media/media.service";

@Injectable()
export class ArticlesService {
   constructor(
      @Inject(DATABASE_CONNECTION)
      private readonly db: NodePgDatabase<typeof schema>,
      private readonly media_service: MediaService,
   ) { }

   /**
    * Create a new article
    * @param form - The form data
    * @param file - The media file (optional)
    */
   public async create(form: CreateArticleDto, file?: Express.Multer.File) {
      let file_url: string | undefined;
      let file_type: ArticleFileTypeEnum | undefined;

      // Upload file if provided
      if (file) {
         file_type = file.mimetype.startsWith('image/') ?
            ArticleFileType.enumValues[0]
            : file.mimetype.startsWith('video/') ?
            ArticleFileType.enumValues[1]
            : ArticleFileType.enumValues[0];
         const uploaded_file = await this.media_service.uploadMedia(file.path, file_type);
         if (!uploaded_file.secure_url) throw new BadRequestException('Failed to upload file');
         file_url = uploaded_file.secure_url;
      }

      // Create article
      const new_article = await this.db.insert(articles).values({
         title: form.title,
         description: form.description,
         file_url: file_url,
         file_type: file_type,
         status: form.status,
      }).returning().then(result => result[0]);

      // Return success response
      return (successResponse('Article created successfully', new_article));
   }

   /**
    * Find all articles with pagination and filters
    * @param filters - The filters
    */
   public async findAll(filters: {
      page: number;
      limit: number;
      search?: string;
      status?: ArticleStatusEnum;
   }) {
      const { page, limit, search, status } = filters;
      const offset = (page - 1) * limit;

      // Build where conditions
      const where_conditions = and(
         ...(search ? [ilike(articles.title, `%${search}%`)] : []),
         ...(status ? [eq(articles.status, status)] : []),
      );

      // Fetch articles and total count
      const [articles_db, total] = await Promise.all([
         this.db.query.articles.findMany({
            limit,
            offset,
            where: where_conditions,
            orderBy: [desc(articles.created_at)],
         }),
         this.db.select({ count: count() }).from(articles).where(where_conditions).then(result => result[0].count),
      ]);

      // Format response
      const result = {
         articles: articles_db,
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
      return successResponse('Articles fetched successfully', result);
   }

   /**
    * Find a single article by id
    * @param id - The article id
    */
   public async findOne(id: string) {
      // Fetch article
      const article_db = await this.db.query.articles.findFirst({
         where: eq(articles.id, id),
      });

      // If article not found, throw an error
      if (!article_db) throw new NotFoundException('Article not found');

      // Return success response
      return successResponse('Article fetched successfully', article_db);
   }

   /**
    * Update an article
    * @param id - The article id
    * @param form - The form data
    * @param file - The media file (optional)
    */
   public async update(id: string, form: UpdateArticleDto, file?: Express.Multer.File) {
      // Check if article exists
      const existing_article = await this.db.query.articles.findFirst({
         where: eq(articles.id, id),
      });

      if (!existing_article) throw new NotFoundException('Article not found');

      let file_url = existing_article.file_url;
      let file_type: ArticleFileTypeEnum | undefined;

      // Upload new file if provided
      if (file) {
         file_type = file.mimetype.startsWith('image/') ?
            ArticleFileType.enumValues[0]
            : file.mimetype.startsWith('video/') ?
            ArticleFileType.enumValues[1]
            : ArticleFileType.enumValues[0];
         // Upload new file
         const uploaded_file = await this.media_service.uploadMedia(file.path, file_type);
         if (!uploaded_file.secure_url) throw new BadRequestException('Failed to upload file');

         // Remove existing file if provided
         if (existing_article.file_url && existing_article.file_type) {
            await this.media_service.deleteMedia(existing_article.file_url, existing_article.file_type);
         }

         // Set new file url
         file_url = uploaded_file.secure_url;
      }

      // Update article
      const updated_article = await this.db.update(articles)
         .set({
            title: form.title,
            description: form.description,
            file_url: file_url,
            file_type: file_type,
            status: form.status,
            updated_at: new Date(),
         })
         .where(eq(articles.id, id))
         .returning()
         .then(result => result[0]);

      // Return success response
      return successResponse('Article updated successfully', updated_article);
   }

   /**
    * Delete an article
    * @param id - The article id
    */
   public async delete(id: string) {
      // Check if article exists
      const existing_article = await this.db.query.articles.findFirst({
         where: eq(articles.id, id),
      });

      if (!existing_article) throw new NotFoundException('Article not found');

      // Delete article
      await this.db.delete(articles).where(eq(articles.id, id));

      // Delete file if provided
      if (existing_article.file_url && existing_article.file_type) {
         await this.media_service.deleteMedia(existing_article.file_url, existing_article.file_type);
      }

      // Return success response
      return successResponse('Article deleted successfully');
   }
}
