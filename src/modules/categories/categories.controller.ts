import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiConsumes, ApiParam, ApiQuery, ApiBearerAuth } from "@nestjs/swagger";
import { CategoriesService } from "./categories.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { multerConfigUploadImage } from "@/common/configs/multer.config";
import { AdminAuthGuard, AdminOrSuperAdminAuthGuard } from "@/common/guards/admin-auth.guard";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { FetchCategoriesDto } from "./dto/fetch-categories.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";



@Controller('categories')
@ApiTags('categories')
export class CategoriesController {
   constructor(private readonly service: CategoriesService) {}

   @Post()
   @UseGuards(AdminAuthGuard, AdminOrSuperAdminAuthGuard)
   @UseInterceptors(FileInterceptor('file', multerConfigUploadImage('../../../uploads')))
   @ApiBearerAuth()
   @ApiOperation({ 
      summary: 'Create a new category',
      description: 'Create a new category with title, status, and image. Uploads the category image to Cloudinary and stores the URL in the database. After successful creation, the categories list cache is invalidated. Requires authentication via access_token cookie. Only accessible by Admin or Super Admin roles.'
   })
   @ApiConsumes('multipart/form-data')
   @ApiBody({ 
      type: CreateCategoryDto,
      description: 'Category creation data including title, status, and image file. Image is required.',
   })
   @ApiResponse({ 
      status: 201, 
      description: 'Category created successfully',
      schema: {
         example: {
            success: true,
            message: 'Category created successfully',
            data: {
               id: '123e4567-e89b-12d3-a456-426614174000',
               title: 'Electronics',
               status: 'ACTIVE',
               image_url: 'https://res.cloudinary.com/demo/image/upload/v1234567890/categories/electronics.jpg',
               created_at: '2024-01-15T10:30:00.000Z',
               updated_at: '2024-01-15T10:30:00.000Z'
            },
            timestamp: '2024-01-15T10:30:00.000Z'
         }
      }
   })
   @ApiResponse({ status: 400, description: 'Bad Request - Image is required or failed to upload image' })
   @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing access token' })
   @ApiResponse({ status: 403, description: 'Forbidden - Only Admin or Super Admin can create categories' })
   async create(@Body() form: CreateCategoryDto, @UploadedFile() file: Express.Multer.File) {
      return (await this.service.create(form, file));
   };

   @Get()
   @UseGuards(AdminAuthGuard, AdminOrSuperAdminAuthGuard)
   @ApiBearerAuth()
   @ApiOperation({ 
      summary: 'Get all categories with pagination and search',
      description: 'Retrieve a paginated list of categories with optional search by title. Supports case-insensitive search and pagination with page and limit parameters. Results are ordered by title in ascending order. Returns categories with pagination metadata including total count, current page, total pages, and navigation flags. Requires authentication via access_token cookie. Only accessible by Admin or Super Admin roles.'
   })
   @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)', example: 1 })
   @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)', example: 10 })
   @ApiQuery({ name: 'search', required: false, type: String, description: 'Search categories by title (case-insensitive)', example: 'Electronics' })
   @ApiResponse({ 
      status: 200, 
      description: 'Categories fetched successfully',
      schema: {
         example: {
            success: true,
            message: 'Categories fetched successfully',
            data: {
               categories: [
                  {
                     id: '123e4567-e89b-12d3-a456-426614174000',
                     title: 'Electronics',
                     status: 'ACTIVE',
                     image_url: 'https://res.cloudinary.com/demo/image/upload/v1234567890/categories/electronics.jpg',
                     created_at: '2024-01-15T10:30:00.000Z',
                     updated_at: '2024-01-15T10:30:00.000Z'
                  }
               ],
               pagination: {
                  total: 25,
                  current_page: 1,
                  total_pages: 3,
                  has_next_page: true,
                  has_previous_page: false
               }
            },
            timestamp: '2024-01-15T10:30:00.000Z'
         }
      }
   })
   @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing access token' })
   @ApiResponse({ status: 403, description: 'Forbidden - Only Admin or Super Admin can view categories' })
   async findAll(@Query() query: FetchCategoriesDto) {
      const filters = {
         page: query.page ? parseInt(query.page.toString()) : 1,
         limit: query.limit ? parseInt(query.limit.toString()) : 10,
         search: query.search ? query.search.toString() : undefined,
      };
      return (await this.service.findAll(filters));
   };

   @Get('list')
   @UseGuards(AdminAuthGuard, AdminOrSuperAdminAuthGuard)
   @ApiBearerAuth()
   @ApiOperation({ 
      summary: 'Get simplified list of active categories',
      description: 'Retrieve a simplified list of all active categories (id and title only) ordered by title. This endpoint is optimized for dropdown/select inputs. Results are cached in Redis for better performance. Requires authentication via access_token cookie. Only accessible by Admin or Super Admin roles.'
   })
   @ApiResponse({ 
      status: 200, 
      description: 'Categories list fetched successfully',
      schema: {
         example: {
            success: true,
            message: 'Categories list fetched successfully',
            data: [
               {
                  id: '123e4567-e89b-12d3-a456-426614174000',
                  title: 'Electronics'
               },
               {
                  id: '223e4567-e89b-12d3-a456-426614174000',
                  title: 'Fashion'
               }
            ],
            timestamp: '2024-01-15T10:30:00.000Z'
         }
      }
   })
   @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing access token' })
   @ApiResponse({ status: 403, description: 'Forbidden - Only Admin or Super Admin can view categories list' })
   async list() {
      return (await this.service.list());
   };

   @Get(':id')
   @UseGuards(AdminAuthGuard, AdminOrSuperAdminAuthGuard)
   @ApiBearerAuth()
   @ApiOperation({ 
      summary: 'Get a single category by ID',
      description: 'Retrieve detailed information about a specific category by its UUID. Returns the complete category object including id, title, status, image_url, and timestamps. Requires authentication via access_token cookie. Only accessible by Admin or Super Admin roles.'
   })
   @ApiParam({ name: 'id', type: String, format: 'uuid', description: 'Category UUID', example: '123e4567-e89b-12d3-a456-426614174000' })
   @ApiResponse({ 
      status: 200, 
      description: 'Category fetched successfully',
      schema: {
         example: {
            success: true,
            message: 'Category fetched successfully',
            data: {
               id: '123e4567-e89b-12d3-a456-426614174000',
               title: 'Electronics',
               status: 'ACTIVE',
               image_url: 'https://res.cloudinary.com/demo/image/upload/v1234567890/categories/electronics.jpg',
               created_at: '2024-01-15T10:30:00.000Z',
               updated_at: '2024-01-15T10:30:00.000Z'
            },
            timestamp: '2024-01-15T10:30:00.000Z'
         }
      }
   })
   @ApiResponse({ status: 400, description: 'Bad Request - Invalid UUID format' })
   @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing access token' })
   @ApiResponse({ status: 403, description: 'Forbidden - Only Admin or Super Admin can view category details' })
   @ApiResponse({ status: 404, description: 'Not Found - Category not found' })
   async findOne(@Param('id', ParseUUIDPipe) id: string) {
      return (await this.service.findOne(id));
   };

   @Put(':id')
   @UseGuards(AdminAuthGuard, AdminOrSuperAdminAuthGuard)
   @UseInterceptors(FileInterceptor('file', multerConfigUploadImage('../../../uploads')))
   @ApiBearerAuth()
   @ApiOperation({ 
      summary: 'Update a category',
      description: 'Update an existing category\'s title, status, and/or image. If a new image file is provided, it will be uploaded to Cloudinary and replace the existing image URL. The image file is optional - if not provided, only title and status will be updated. After successful update, the categories list cache is invalidated. Requires authentication via access_token cookie. Only accessible by Admin or Super Admin roles.'
   })
   @ApiConsumes('multipart/form-data')
   @ApiParam({ name: 'id', type: String, format: 'uuid', description: 'Category UUID to update', example: '123e4567-e89b-12d3-a456-426614174000' })
   @ApiBody({ 
      type: UpdateCategoryDto,
      description: 'Category update data including optional title, status, and image file.',
   })
   @ApiResponse({ 
      status: 200, 
      description: 'Category updated successfully',
      schema: {
         example: {
            success: true,
            message: 'Category updated successfully',
            data: {
               id: '123e4567-e89b-12d3-a456-426614174000',
               title: 'Electronics & Gadgets',
               status: 'ACTIVE',
               image_url: 'https://res.cloudinary.com/demo/image/upload/v1234567890/categories/electronics-new.jpg',
               created_at: '2024-01-15T10:30:00.000Z',
               updated_at: '2024-01-15T12:45:00.000Z'
            },
            timestamp: '2024-01-15T12:45:00.000Z'
         }
      }
   })
   @ApiResponse({ status: 400, description: 'Bad Request - Invalid UUID format or failed to upload image' })
   @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing access token' })
   @ApiResponse({ status: 403, description: 'Forbidden - Only Admin or Super Admin can update categories' })
   @ApiResponse({ status: 404, description: 'Not Found - Category not found' })
   async update(
      @Param('id', ParseUUIDPipe) id: string,
      @Body() form: UpdateCategoryDto,
      @UploadedFile() file: Express.Multer.File | undefined,
   ) {
      return (await this.service.update(id, form, file));
   };

   @Delete(':id')
   @UseGuards(AdminAuthGuard, AdminOrSuperAdminAuthGuard)
   @ApiBearerAuth()
   @ApiOperation({ 
      summary: 'Delete a category',
      description: 'Delete a category by its UUID. This operation will attempt to delete the category image from Cloudinary if an image URL exists (errors are logged but don\'t prevent deletion). After successful deletion, the categories list cache is invalidated. Requires authentication via access_token cookie. Only accessible by Admin or Super Admin roles.'
   })
   @ApiParam({ name: 'id', type: String, format: 'uuid', description: 'Category UUID to delete', example: '123e4567-e89b-12d3-a456-426614174000' })
   @ApiResponse({ 
      status: 200, 
      description: 'Category deleted successfully',
      schema: {
         example: {
            success: true,
            message: 'Category deleted successfully',
            data: {
               id: '123e4567-e89b-12d3-a456-426614174000',
               title: 'Electronics',
               status: 'ACTIVE',
               image_url: 'https://res.cloudinary.com/demo/image/upload/v1234567890/categories/electronics.jpg',
               created_at: '2024-01-15T10:30:00.000Z',
               updated_at: '2024-01-15T10:30:00.000Z'
            },
            timestamp: '2024-01-15T14:20:00.000Z'
         }
      }
   })
   @ApiResponse({ status: 400, description: 'Bad Request - Invalid UUID format' })
   @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing access token' })
   @ApiResponse({ status: 403, description: 'Forbidden - Only Admin or Super Admin can delete categories' })
   @ApiResponse({ status: 404, description: 'Not Found - Category not found' })
   async delete(@Param('id', ParseUUIDPipe) id: string) {
      return (await this.service.delete(id));
   };
};
