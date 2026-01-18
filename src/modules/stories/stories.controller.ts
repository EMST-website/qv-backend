import { Controller, Delete, Get, Param, ParseUUIDPipe, Put, Query, Body, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { StoriesService } from "./stories.service";
import { UpdateStoryDto } from "./dto/update-story.dto";
import { FetchStoriesDto } from "./dto/fetch-stories.dto";
import { AdminAuthGuard, AdminOrSuperAdminAuthGuard } from "@/common/guards/admin-auth.guard";

@Controller('stories')
@ApiTags('stories')
export class StoriesController {
   constructor(private readonly service: StoriesService) {}

   @Get()
   @UseGuards(AdminAuthGuard, AdminOrSuperAdminAuthGuard)
   @ApiBearerAuth()
   @ApiOperation({ 
      summary: 'Get all stories with pagination and filters',
      description: 'Retrieves a paginated list of stories with optional filtering by author name (first/last name), organization IDs, and user IDs. Returns stories with associated user information ordered by creation date (newest first) along with pagination metadata.'
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
      description: 'Search term to filter stories by author name (first name or last name). Case-insensitive partial match.',
      example: 'John'
   })
   @ApiQuery({
      name: 'organization_ids',
      required: false,
      type: [String],
      description: 'Filter stories by organization UUIDs. Comma-separated list.',
      example: '550e8400-e29b-41d4-a716-446655440000,660e8400-e29b-41d4-a716-446655440001'
   })
   @ApiQuery({
      name: 'user_ids',
      required: false,
      type: [String],
      description: 'Filter stories by user UUIDs. Comma-separated list.',
      example: '550e8400-e29b-41d4-a716-446655440000'
   })
   @ApiResponse({
      status: 200,
      description: 'Stories retrieved successfully',
      schema: {
         example: {
            success: true,
            message: 'Stories fetched successfully',
            data: {
               stories: [
                  {
                     id: '550e8400-e29b-41d4-a716-446655440000',
                     details: 'This is my inspiring story about overcoming challenges...',
                     status: 'PUBLISHED',
                     user_id: '660e8400-e29b-41d4-a716-446655440000',
                     created_at: '2026-01-18T10:00:00.000Z',
                     updated_at: '2026-01-18T10:00:00.000Z',
                     user: {
                        id: '660e8400-e29b-41d4-a716-446655440000',
                        first_name: 'John',
                        last_name: 'Doe',
                        email: 'john@example.com',
                        image_url: 'https://example.com/image.jpg',
                        title: 'Software Engineer',
                        organization_id: '770e8400-e29b-41d4-a716-446655440000'
                     }
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
   async findAll(@Query() query: FetchStoriesDto) {
      const filters = {
         page: query.page ? parseInt(query.page.toString()) : 1,
         limit: query.limit ? parseInt(query.limit.toString()) : 10,
         search: query.search ? query.search.toString() : undefined,
         organization_ids: query.organization_ids,
         user_ids: query.user_ids,
      };
      return await this.service.findAll(filters);
   }

   @Get(':id')
   @UseGuards(AdminAuthGuard, AdminOrSuperAdminAuthGuard)
   @ApiBearerAuth()
   @ApiOperation({ 
      summary: 'Get a single story by ID',
      description: 'Retrieves detailed information about a specific story by its UUID. Returns the story with associated user information including author details. Throws a 404 error if the story is not found.'
   })
   @ApiParam({
      name: 'id',
      type: String,
      description: 'UUID of the story to retrieve',
      example: '550e8400-e29b-41d4-a716-446655440000'
   })
   @ApiResponse({
      status: 200,
      description: 'Story retrieved successfully',
      schema: {
         example: {
            success: true,
            message: 'Story fetched successfully',
            data: {
               id: '550e8400-e29b-41d4-a716-446655440000',
               details: 'This is my inspiring story about overcoming challenges and achieving success...',
               status: 'PUBLISHED',
               user_id: '660e8400-e29b-41d4-a716-446655440000',
               created_at: '2026-01-18T10:00:00.000Z',
               updated_at: '2026-01-18T10:00:00.000Z',
               user: {
                  id: '660e8400-e29b-41d4-a716-446655440000',
                  first_name: 'John',
                  last_name: 'Doe',
                  email: 'john@example.com',
                  image_url: 'https://example.com/image.jpg',
                  title: 'Software Engineer',
                  organization_id: '770e8400-e29b-41d4-a716-446655440000'
               }
            }
         }
      }
   })
   @ApiResponse({ status: 400, description: 'Bad request - invalid UUID format' })
   @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing authentication token' })
   @ApiResponse({ status: 403, description: 'Forbidden - user does not have admin or super admin role' })
   @ApiResponse({ status: 404, description: 'Not found - story with the specified ID does not exist' })
   async findOne(@Param('id', ParseUUIDPipe) id: string) {
      return await this.service.findOne(id);
   }

   @Put(':id')
   @UseGuards(AdminAuthGuard, AdminOrSuperAdminAuthGuard)
   @ApiBearerAuth()
   @ApiOperation({ 
      summary: 'Update story status (admin only)',
      description: 'Updates the status of a story by its UUID. Admins can only change the status field (PUBLISHED or UNPUBLISHED). The story details cannot be modified by admins.'
   })
   @ApiParam({
      name: 'id',
      type: String,
      description: 'UUID of the story to update',
      example: '550e8400-e29b-41d4-a716-446655440000'
   })
   @ApiBody({
      type: UpdateStoryDto,
      description: 'Story update data. Only status can be changed by admin.',
      examples: {
         example1: {
            summary: 'Publish story',
            value: {
               status: 'PUBLISHED'
            }
         },
         example2: {
            summary: 'Unpublish story',
            value: {
               status: 'UNPUBLISHED'
            }
         }
      }
   })
   @ApiResponse({
      status: 200,
      description: 'Story status updated successfully',
      schema: {
         example: {
            success: true,
            message: 'Story status updated successfully',
            data: {
               id: '550e8400-e29b-41d4-a716-446655440000',
               details: 'This is my inspiring story...',
               status: 'PUBLISHED',
               user_id: '660e8400-e29b-41d4-a716-446655440000',
               created_at: '2026-01-18T10:00:00.000Z',
               updated_at: '2026-01-18T11:00:00.000Z'
            }
         }
      }
   })
   @ApiResponse({ status: 400, description: 'Bad request - validation failed or invalid UUID' })
   @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing authentication token' })
   @ApiResponse({ status: 403, description: 'Forbidden - user does not have admin or super admin role' })
   @ApiResponse({ status: 404, description: 'Not found - story with the specified ID does not exist' })
   async update(
      @Param('id', ParseUUIDPipe) id: string,
      @Body() form: UpdateStoryDto,
   ) {
      return await this.service.update(id, form);
   }

   @Delete(':id')
   @UseGuards(AdminAuthGuard, AdminOrSuperAdminAuthGuard)
   @ApiBearerAuth()
   @ApiOperation({ 
      summary: 'Delete a story',
      description: 'Permanently deletes a story by its UUID. This action cannot be undone.'
   })
   @ApiParam({
      name: 'id',
      type: String,
      description: 'UUID of the story to delete',
      example: '550e8400-e29b-41d4-a716-446655440000'
   })
   @ApiResponse({
      status: 200,
      description: 'Story deleted successfully',
      schema: {
         example: {
            success: true,
            message: 'Story deleted successfully'
         }
      }
   })
   @ApiResponse({ status: 400, description: 'Bad request - invalid UUID format' })
   @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing authentication token' })
   @ApiResponse({ status: 403, description: 'Forbidden - user does not have admin or super admin role' })
   @ApiResponse({ status: 404, description: 'Not found - story with the specified ID does not exist' })
   async remove(@Param('id', ParseUUIDPipe) id: string) {
      return await this.service.remove(id);
   }
}
