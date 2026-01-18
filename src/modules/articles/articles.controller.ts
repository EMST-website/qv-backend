import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ArticlesService } from "./articles.service";
import { CreateArticleDto } from "./dto/create-article.dto";
import { UpdateArticleDto } from "./dto/update-article.dto";
import { FetchArticlesDto } from "./dto/fetch-articles.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { multerConfigUploadImage } from "@/common/configs/multer.config";
import { AdminAuthGuard, AdminOrSuperAdminAuthGuard } from "@/common/guards/admin-auth.guard";
import { ArticleStatusEnum } from "./articles.schema";

@Controller('articles')
@ApiTags('articles')
export class ArticlesController {
   constructor(private readonly service: ArticlesService) {}

   @Post()
   @UseGuards(AdminAuthGuard, AdminOrSuperAdminAuthGuard)
   @UseInterceptors(FileInterceptor('file', multerConfigUploadImage('../../../uploads', true)))
   @ApiBearerAuth()
   @ApiOperation({ 
      summary: 'Create a new article',
      description: 'Creates a new article with optional media file upload (image or video). Requires admin or super admin authentication. The article can be created in DRAFT, PUBLISHED, or UNPUBLISHED status. If a file is provided, it is uploaded to Cloudinary.'
   })
   @ApiConsumes('multipart/form-data')
   @ApiBody({
      type: CreateArticleDto,
      description: 'Article creation data including title, description, status, and optional media file',
      examples: {
         example1: {
            summary: 'Article with image',
            value: {
               title: 'Introduction to Quantum Computing',
               description: 'This article explores the fundamentals of quantum computing and its potential applications.',
               status: 'DRAFT',
               file: '(binary)'
            }
         }
      }
   })
   @ApiResponse({
      status: 201,
      description: 'Article created successfully',
      schema: {
         example: {
            success: true,
            message: 'Article created successfully',
            data: {
               id: '550e8400-e29b-41d4-a716-446655440000',
               title: 'Introduction to Quantum Computing',
               description: 'This article explores the fundamentals of quantum computing',
               file_url: 'https://res.cloudinary.com/example/image.jpg',
               file_type: 'IMG',
               status: 'DRAFT',
               created_at: '2026-01-18T10:00:00.000Z',
               updated_at: '2026-01-18T10:00:00.000Z'
            }
         }
      }
   })
   @ApiResponse({ status: 400, description: 'Bad request - validation failed or file upload failed' })
   @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing authentication token' })
   @ApiResponse({ status: 403, description: 'Forbidden - user does not have admin or super admin role' })
   async create(@Body() form: CreateArticleDto, @UploadedFile() file?: Express.Multer.File) {
      return (await this.service.create(form, file));
   }

   @Get()
   @UseGuards(AdminAuthGuard, AdminOrSuperAdminAuthGuard)
   @ApiBearerAuth()
   @ApiOperation({ 
      summary: 'Get all articles with pagination and filters',
      description: 'Retrieves a paginated list of articles with optional filtering by search term and status. Supports pagination with customizable page size. Returns articles ordered by creation date (newest first) along with pagination metadata.'
   })
   @ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      description: 'Page number for pagination. Default is 1.',
      example: 1
   })
   @ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      description: 'Number of items per page. Default is 10.',
      example: 10
   })
   @ApiQuery({
      name: 'search',
      required: false,
      type: String,
      description: 'Search term to filter articles by title. Case-insensitive partial match.',
      example: 'Quantum'
   })
   @ApiQuery({
      name: 'status',
      required: false,
      enum: ['DRAFT', 'PUBLISHED', 'UNPUBLISHED'],
      description: 'Filter articles by status.',
      example: 'PUBLISHED'
   })
   @ApiResponse({
      status: 200,
      description: 'Articles retrieved successfully',
      schema: {
         example: {
            success: true,
            message: 'Articles fetched successfully',
            data: {
               articles: [
                  {
                     id: '550e8400-e29b-41d4-a716-446655440000',
                     title: 'Introduction to Quantum Computing',
                     description: 'This article explores the fundamentals',
                     file_url: 'https://res.cloudinary.com/example/image.jpg',
                     file_type: 'IMG',
                     status: 'PUBLISHED',
                     created_at: '2026-01-18T10:00:00.000Z',
                     updated_at: '2026-01-18T10:00:00.000Z'
                  }
               ],
               pagination: {
                  total: 25,
                  total_pages: 3,
                  page: 1,
                  limit: 10,
                  has_next: true,
                  has_previous: false
               }
            }
         }
      }
   })
   @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing authentication token' })
   @ApiResponse({ status: 403, description: 'Forbidden - user does not have admin or super admin role' })
   async findAll(@Query() query: FetchArticlesDto) {
      const filters = {
         page: query.page ? parseInt(query.page.toString()) : 1,
         limit: query.limit ? parseInt(query.limit.toString()) : 10,
         search: query.search ? query.search.toString() : undefined,
         status: query.status ? query.status as ArticleStatusEnum : undefined,
      };
      return (await this.service.findAll(filters));
   }

   @Get(':id')
   @UseGuards(AdminAuthGuard, AdminOrSuperAdminAuthGuard)
   @ApiBearerAuth()
   @ApiOperation({ 
      summary: 'Get a single article by ID',
      description: 'Retrieves detailed information about a specific article by its UUID. Returns the complete article data including title, description, file URL, file type, and status. Throws a 404 error if the article is not found.'
   })
   @ApiParam({
      name: 'id',
      type: String,
      description: 'UUID of the article to retrieve',
      example: '550e8400-e29b-41d4-a716-446655440000'
   })
   @ApiResponse({
      status: 200,
      description: 'Article retrieved successfully',
      schema: {
         example: {
            success: true,
            message: 'Article fetched successfully',
            data: {
               id: '550e8400-e29b-41d4-a716-446655440000',
               title: 'Introduction to Quantum Computing',
               description: 'This article explores the fundamentals of quantum computing and its potential applications in modern technology.',
               file_url: 'https://res.cloudinary.com/example/image.jpg',
               file_type: 'IMG',
               status: 'PUBLISHED',
               created_at: '2026-01-18T10:00:00.000Z',
               updated_at: '2026-01-18T10:00:00.000Z'
            }
         }
      }
   })
   @ApiResponse({ status: 400, description: 'Bad request - invalid UUID format' })
   @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing authentication token' })
   @ApiResponse({ status: 403, description: 'Forbidden - user does not have admin or super admin role' })
   @ApiResponse({ status: 404, description: 'Not found - article with the specified ID does not exist' })
   async findOne(@Param('id', ParseUUIDPipe) id: string) {
      return await this.service.findOne(id);
   }

   // the file should be optional
   @Put(':id')
   @UseGuards(AdminAuthGuard, AdminOrSuperAdminAuthGuard)
   @UseInterceptors(FileInterceptor('file', multerConfigUploadImage('../../../uploads', true)))
   @ApiBearerAuth()
   @ApiOperation({ 
      summary: 'Update an existing article',
      description: 'Updates an article by its UUID. All fields are optional - only provided fields will be updated. If a new file is uploaded, the old file is deleted from Cloudinary and replaced. Returns the updated article data.'
   })
   @ApiConsumes('multipart/form-data')
   @ApiParam({
      name: 'id',
      type: String,
      description: 'UUID of the article to update',
      example: '550e8400-e29b-41d4-a716-446655440000'
   })
   @ApiBody({
      type: UpdateArticleDto,
      description: 'Article update data. All fields are optional.',
      examples: {
         example1: {
            summary: 'Update status',
            value: {
               status: 'PUBLISHED'
            }
         },
         example2: {
            summary: 'Update with new file',
            value: {
               title: 'Advanced Quantum Computing',
               file: '(binary)'
            }
         }
      }
   })
   @ApiResponse({
      status: 200,
      description: 'Article updated successfully',
      schema: {
         example: {
            success: true,
            message: 'Article updated successfully',
            data: {
               id: '550e8400-e29b-41d4-a716-446655440000',
               title: 'Advanced Quantum Computing',
               description: 'This article explores the fundamentals',
               file_url: 'https://res.cloudinary.com/example/new-image.jpg',
               file_type: 'IMG',
               status: 'PUBLISHED',
               created_at: '2026-01-18T10:00:00.000Z',
               updated_at: '2026-01-18T11:00:00.000Z'
            }
         }
      }
   })
   @ApiResponse({ status: 400, description: 'Bad request - validation failed, invalid UUID, or file upload failed' })
   @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing authentication token' })
   @ApiResponse({ status: 403, description: 'Forbidden - user does not have admin or super admin role' })
   @ApiResponse({ status: 404, description: 'Not found - article with the specified ID does not exist' })
   async update(
      @Param('id', ParseUUIDPipe) id: string,
      @Body() form: UpdateArticleDto,
      @UploadedFile() file?: Express.Multer.File,
   ) {
      return (await this.service.update(id, form, file));
   }

   @Delete(':id')
   @UseGuards(AdminAuthGuard, AdminOrSuperAdminAuthGuard)
   @ApiBearerAuth()
   @ApiOperation({ 
      summary: 'Delete an article',
      description: 'Permanently deletes an article by its UUID. The associated media file is also removed from Cloudinary if it exists. This action cannot be undone.'
   })
   @ApiParam({
      name: 'id',
      type: String,
      description: 'UUID of the article to delete',
      example: '550e8400-e29b-41d4-a716-446655440000'
   })
   @ApiResponse({
      status: 200,
      description: 'Article deleted successfully',
      schema: {
         example: {
            success: true,
            message: 'Article deleted successfully'
         }
      }
   })
   @ApiResponse({ status: 400, description: 'Bad request - invalid UUID format' })
   @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing authentication token' })
   @ApiResponse({ status: 403, description: 'Forbidden - user does not have admin or super admin role' })
   @ApiResponse({ status: 404, description: 'Not found - article with the specified ID does not exist' })
   async delete(@Param('id', ParseUUIDPipe) id: string) {
      return (await this.service.delete(id));
   }
}
