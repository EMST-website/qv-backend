import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ProductsService } from "./products.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { multerConfigUploadImage } from "@/common/configs/multer.config";
import { AdminAuthGuard, AdminOrSuperAdminAuthGuard } from "@/common/guards/admin-auth.guard";
import { CreateProductDto } from "./dto/create-product.dto";
import { FetchProductsDto } from "./dto/fetch-products.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { ProductStatusEnum } from "./products.schema";

@Controller('products')
@ApiTags('products')
export class ProductsController {
   constructor(private readonly service: ProductsService) {}

   @Post()
   @UseGuards(AdminAuthGuard, AdminOrSuperAdminAuthGuard)
   @UseInterceptors(FileInterceptor('file', multerConfigUploadImage('../../../uploads')))
   @ApiBearerAuth()
   @ApiOperation({ 
      summary: 'Create a new product',
      description: 'Creates a new product with image upload, category associations, and optional product details. Requires admin or super admin authentication. The product is created in a transaction that includes uploading the image to Cloudinary, inserting the product record, adding product details, and creating category relationships.'
   })
   @ApiConsumes('multipart/form-data')
   @ApiBody({
      type: CreateProductDto,
      description: 'Product creation data including title, description, status, category IDs, optional details, and image file',
      examples: {
         example1: {
            summary: 'Product with details',
            value: {
               title: 'Wireless Bluetooth Headphones',
               description: 'High-quality wireless headphones with noise cancellation and 20-hour battery life',
               status: 'ACTIVE',
               category_ids: ['550e8400-e29b-41d4-a716-446655440000'],
               details: [
                  { label: 'Color', value: 'Blue' },
                  { label: 'Weight', value: '250g' }
               ],
               file: '(binary)'
            }
         }
      }
   })
   @ApiResponse({
      status: 201,
      description: 'Product created successfully',
      schema: {
         example: {
            success: true,
            message: 'Product created successfully',
            data: {
               id: '550e8400-e29b-41d4-a716-446655440000',
               title: 'Wireless Bluetooth Headphones',
               description: 'High-quality wireless headphones with noise cancellation',
               status: 'ACTIVE',
               image_url: 'https://res.cloudinary.com/example/image.jpg',
               created_at: '2026-01-18T10:00:00.000Z',
               updated_at: '2026-01-18T10:00:00.000Z',
               details: [
                  { id: '...' , product_id: '...', label: 'Color', value: 'Blue', created_at: '...', updated_at: '...' }
               ],
               categories: [
                  { id: '550e8400-e29b-41d4-a716-446655440000', title: 'Electronics' }
               ]
            }
         }
      }
   })
   @ApiResponse({ status: 400, description: 'Bad request - validation failed or image upload failed' })
   @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing authentication token' })
   @ApiResponse({ status: 403, description: 'Forbidden - user does not have admin or super admin role' })
   async create(@Body() form: CreateProductDto, @UploadedFile() file: Express.Multer.File) {
      return (await this.service.create(form, file));
   }

   @Get()
   @UseGuards(AdminAuthGuard, AdminOrSuperAdminAuthGuard)
   @ApiBearerAuth()
   @ApiOperation({ 
      summary: 'Get all products with pagination and filters',
      description: 'Retrieves a paginated list of products with optional filtering by search term, category, and status. Supports pagination with customizable page size. Returns products ordered by creation date (newest first) along with pagination metadata including total count, total pages, and navigation flags.'
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
      description: 'Search term to filter products by title. Case-insensitive partial match.',
      example: 'Wireless'
   })
   @ApiQuery({
      name: 'category_id',
      required: false,
      type: String,
      description: 'Filter products by category UUID.',
      example: '550e8400-e29b-41d4-a716-446655440000'
   })
   @ApiQuery({
      name: 'status',
      required: false,
      enum: ['ACTIVE', 'INACTIVE'],
      description: 'Filter products by status.',
      example: 'ACTIVE'
   })
   @ApiResponse({
      status: 200,
      description: 'Products retrieved successfully',
      schema: {
         example: {
            success: true,
            message: 'Products fetched successfully',
            data: {
               products: [
                  {
                     id: '550e8400-e29b-41d4-a716-446655440000',
                     title: 'Wireless Bluetooth Headphones',
                     description: 'High-quality wireless headphones',
                     status: 'ACTIVE',
                     image_url: 'https://res.cloudinary.com/example/image.jpg',
                     created_at: '2026-01-18T10:00:00.000Z',
                     updated_at: '2026-01-18T10:00:00.000Z'
                  }
               ],
               pagination: {
                  total: 50,
                  total_pages: 5,
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
   async findAll(@Query() query: FetchProductsDto) {
      const filters = {
         page: query.page ? parseInt(query.page.toString()) : 1,
         limit: query.limit ? parseInt(query.limit.toString()) : 10,
         search: query.search ? query.search.toString() : undefined,
         category_id: query.category_id ? query.category_id.toString() : undefined,
         status: query.status ? query.status as ProductStatusEnum : undefined,
      };
      return (await this.service.findAll(filters));
   }

   @Get(':id')
   @UseGuards(AdminAuthGuard, AdminOrSuperAdminAuthGuard)
   @ApiBearerAuth()
   @ApiOperation({ 
      summary: 'Get a single product by ID',
      description: 'Retrieves detailed information about a specific product by its UUID. Returns the product with all associated details (attributes/specifications) and categories. Throws a 404 error if the product is not found.'
   })
   @ApiParam({
      name: 'id',
      type: String,
      description: 'UUID of the product to retrieve',
      example: '550e8400-e29b-41d4-a716-446655440000'
   })
   @ApiResponse({
      status: 200,
      description: 'Product retrieved successfully',
      schema: {
         example: {
            success: true,
            message: 'Product fetched successfully',
            data: {
               id: '550e8400-e29b-41d4-a716-446655440000',
               title: 'Wireless Bluetooth Headphones',
               description: 'High-quality wireless headphones with noise cancellation',
               status: 'ACTIVE',
               image_url: 'https://res.cloudinary.com/example/image.jpg',
               created_at: '2026-01-18T10:00:00.000Z',
               updated_at: '2026-01-18T10:00:00.000Z',
               details: [
                  { id: '...', product_id: '...', label: 'Color', value: 'Blue', created_at: '...', updated_at: '...' },
                  { id: '...', product_id: '...', label: 'Weight', value: '250g', created_at: '...', updated_at: '...' }
               ],
               categories: [
                  { id: '550e8400-e29b-41d4-a716-446655440000', title: 'Electronics' }
               ]
            }
         }
      }
   })
   @ApiResponse({ status: 400, description: 'Bad request - invalid UUID format' })
   @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing authentication token' })
   @ApiResponse({ status: 403, description: 'Forbidden - user does not have admin or super admin role' })
   @ApiResponse({ status: 404, description: 'Not found - product with the specified ID does not exist' })
   async findOne(@Param('id', ParseUUIDPipe) id: string) {
      return (await this.service.findOne(id));
   }

   @Put(':id')
   @UseGuards(AdminAuthGuard, AdminOrSuperAdminAuthGuard)
   @UseInterceptors(FileInterceptor('file', multerConfigUploadImage('../../../uploads')))
   @ApiBearerAuth()
   @ApiOperation({ 
      summary: 'Update an existing product',
      description: 'Updates a product by its UUID. All fields are optional - only provided fields will be updated. If a new image is uploaded, the old image is deleted from Cloudinary and replaced. Product details and category relationships can be completely replaced by providing new arrays. The update is performed in a transaction to ensure data consistency. Returns the updated product with all associations.'
   })
   @ApiConsumes('multipart/form-data')
   @ApiParam({
      name: 'id',
      type: String,
      description: 'UUID of the product to update',
      example: '550e8400-e29b-41d4-a716-446655440000'
   })
   @ApiBody({
      type: UpdateProductDto,
      description: 'Product update data. All fields are optional. Provided arrays (details, category_ids) replace existing values entirely.',
      examples: {
         example1: {
            summary: 'Update with new image',
            value: {
               title: 'Premium Wireless Headphones',
               status: 'ACTIVE',
               file: '(binary)'
            }
         },
         example2: {
            summary: 'Update details only',
            value: {
               details: [
                  { label: 'Color', value: 'Black' },
                  { label: 'Battery Life', value: '30 hours' }
               ]
            }
         }
      }
   })
   @ApiResponse({
      status: 200,
      description: 'Product updated successfully',
      schema: {
         example: {
            success: true,
            message: 'Product updated successfully',
            data: {
               id: '550e8400-e29b-41d4-a716-446655440000',
               title: 'Premium Wireless Headphones',
               description: 'High-quality wireless headphones',
               status: 'ACTIVE',
               image_url: 'https://res.cloudinary.com/example/new-image.jpg',
               created_at: '2026-01-18T10:00:00.000Z',
               updated_at: '2026-01-18T11:00:00.000Z',
               details: [
                  { id: '...', product_id: '...', label: 'Color', value: 'Black', created_at: '...', updated_at: '...' }
               ],
               categories: [
                  { id: '550e8400-e29b-41d4-a716-446655440000', title: 'Electronics' }
               ]
            }
         }
      }
   })
   @ApiResponse({ status: 400, description: 'Bad request - validation failed, invalid UUID, or image upload failed' })
   @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing authentication token' })
   @ApiResponse({ status: 403, description: 'Forbidden - user does not have admin or super admin role' })
   @ApiResponse({ status: 404, description: 'Not found - product with the specified ID does not exist' })
   async update(
      @Param('id', ParseUUIDPipe) id: string,
      @Body() form: UpdateProductDto,
      @UploadedFile() file: Express.Multer.File | undefined,
   ) {
      return (await this.service.update(id, form, file));
   }

   @Delete(':id')
   @UseGuards(AdminAuthGuard, AdminOrSuperAdminAuthGuard)
   @ApiBearerAuth()
   @ApiOperation({ 
      summary: 'Delete a product',
      description: 'Permanently deletes a product by its UUID. This operation cascades to delete all associated product details and category relationships. The product image is also removed from Cloudinary. This action cannot be undone.'
   })
   @ApiParam({
      name: 'id',
      type: String,
      description: 'UUID of the product to delete',
      example: '550e8400-e29b-41d4-a716-446655440000'
   })
   @ApiResponse({
      status: 200,
      description: 'Product deleted successfully',
      schema: {
         example: {
            success: true,
            message: 'Product deleted successfully'
         }
      }
   })
   @ApiResponse({ status: 400, description: 'Bad request - invalid UUID format' })
   @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing authentication token' })
   @ApiResponse({ status: 403, description: 'Forbidden - user does not have admin or super admin role' })
   @ApiResponse({ status: 404, description: 'Not found - product with the specified ID does not exist' })
   async remove(@Param('id', ParseUUIDPipe) id: string) {
      return (await this.service.remove(id));
   }
}
