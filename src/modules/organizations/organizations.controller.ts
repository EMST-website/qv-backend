import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { AdminAuthGuard, AdminOrSuperAdminAuthGuard } from '@/common/guards/admin-auth.guard';
import { FetchOrganizationsDto } from './dto/fetch-organizations.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@ApiTags('organizations')
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post('')
  @UseGuards(AdminAuthGuard, AdminOrSuperAdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Create a new organization',
    description: 'Create a new organization with name, country, city, and status. Validates that the organization name is unique, the country and city exist, the city belongs to the specified country, and both country and city are active. After successful creation, the organizations list cache is invalidated. Requires authentication via access_token cookie. Only accessible by Admin or Super Admin roles.'
  })
  @ApiBody({ 
    type: CreateOrganizationDto,
    description: 'Organization creation data. All fields are required.',
    examples: {
      activeOrganization: {
        summary: 'Create active organization',
        value: {
          name: 'Tech Solutions Inc.',
          country_id: '123e4567-e89b-12d3-a456-426614174000',
          city_id: '223e4567-e89b-12d3-a456-426614174000',
          status: 'ACTIVE'
        }
      },
      inactiveOrganization: {
        summary: 'Create inactive organization',
        value: {
          name: 'Legacy Systems Ltd.',
          country_id: '123e4567-e89b-12d3-a456-426614174000',
          city_id: '223e4567-e89b-12d3-a456-426614174000',
          status: 'INACTIVE'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Organization created successfully',
    schema: {
      example: {
        success: true,
        message: 'Organization created successfully',
        data: {
          id: '323e4567-e89b-12d3-a456-426614174000',
          name: 'Tech Solutions Inc.',
          country_id: '123e4567-e89b-12d3-a456-426614174000',
          city_id: '223e4567-e89b-12d3-a456-426614174000',
          status: 'ACTIVE',
          created_at: '2024-01-15T10:30:00.000Z',
          updated_at: '2024-01-15T10:30:00.000Z'
        },
        timestamp: '2024-01-15T10:30:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Organization already exists, country not found, city not found, city does not belong to country, or country/city is inactive' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing access token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only Admin or Super Admin can create organizations' })
  async create(@Body() createOrganizationDto: CreateOrganizationDto) {
    return (await this.organizationsService.create(createOrganizationDto));
  };

  @Get('')
  @UseGuards(AdminAuthGuard, AdminOrSuperAdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get all organizations with pagination and filters',
    description: 'Retrieve a paginated list of organizations with optional filters by name and country_id. Supports pagination with page and limit parameters. Results are ordered by name in descending order. Returns organizations with pagination metadata including total count, current page, total pages, and navigation flags. Requires authentication via access_token cookie. Only accessible by Admin or Super Admin roles.'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)', example: 10 })
  @ApiQuery({ name: 'name', required: false, type: String, description: 'Filter organizations by exact name match', example: 'Tech Solutions Inc.' })
  @ApiQuery({ name: 'country_id', required: false, type: String, format: 'uuid', description: 'Filter organizations by country UUID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ 
    status: 200, 
    description: 'Organizations retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Organizations fetched successfully',
        data: {
          organizations: [
            {
              id: '323e4567-e89b-12d3-a456-426614174000',
              name: 'Tech Solutions Inc.',
              country_id: '123e4567-e89b-12d3-a456-426614174000',
              city_id: '223e4567-e89b-12d3-a456-426614174000',
              status: 'ACTIVE',
              created_at: '2024-01-15T10:30:00.000Z',
              updated_at: '2024-01-15T10:30:00.000Z'
            }
          ],
          pagination: {
            total: 1,
            current_page: 1,
            total_pages: 1,
            has_next_page: false,
            has_previous_page: false
          }
        },
        timestamp: '2024-01-15T10:30:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing access token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only Admin or Super Admin can view organizations' })
  async fetchAll(@Query() query: FetchOrganizationsDto) {
    const filters = {
      page: query.page ? parseInt(query.page.toString(), 10) : 1,
      limit: query.limit ? parseInt(query.limit.toString(), 10) : 10,
      name: query.name ? query.name : undefined,
      country_id: query.country_id ? query.country_id : undefined,
    }
    return (await this.organizationsService.fetchAll(filters));
  };

  @Get('list')
  @UseGuards(AdminAuthGuard, AdminOrSuperAdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get organizations list for dropdown',
    description: 'Retrieve a cached list of all organizations with only id and name fields. This endpoint is optimized for dropdown/select components. Data is cached in Redis with key "organizations_list" for performance. On first request, data is fetched from database and cached. Subsequent requests return cached data until cache is invalidated (e.g., after create, update, or delete operations). Results are ordered by name in ascending order. Requires authentication via access_token cookie. Only accessible by Admin or Super Admin roles.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Organizations list retrieved successfully (from cache or database)',
    schema: {
      examples: {
        fromCache: {
          summary: 'Response from cache',
          value: {
            success: true,
            message: 'Organizations fetched successfully from cache',
            data: [
              {
                id: '323e4567-e89b-12d3-a456-426614174000',
                name: 'Tech Solutions Inc.'
              },
              {
                id: '423e4567-e89b-12d3-a456-426614174000',
                name: 'Global Enterprises Ltd.'
              }
            ],
            timestamp: '2024-01-15T10:30:00.000Z'
          }
        },
        fromDatabase: {
          summary: 'Response from database',
          value: {
            success: true,
            message: 'Organizations fetched successfully from db',
            data: [
              {
                id: '323e4567-e89b-12d3-a456-426614174000',
                name: 'Tech Solutions Inc.'
              },
              {
                id: '423e4567-e89b-12d3-a456-426614174000',
                name: 'Global Enterprises Ltd.'
              }
            ],
            timestamp: '2024-01-15T10:30:00.000Z'
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing access token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only Admin or Super Admin can view organizations list' })
  async fetchList() {
    return (await this.organizationsService.fetchList());
  };

  @Delete(':id')
  @UseGuards(AdminAuthGuard, AdminOrSuperAdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Delete an organization',
    description: 'Delete an organization by ID. Validates that the organization exists and has no associated users. If the organization has users, deletion is prevented to maintain data integrity. After successful deletion, the organizations list cache is invalidated. Requires authentication via access_token cookie. Only accessible by Admin or Super Admin roles.'
  })
  @ApiParam({ 
    name: 'id', 
    type: String,
    format: 'uuid',
    description: 'Organization UUID to delete',
    example: '323e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Organization deleted successfully',
    schema: {
      example: {
        success: true,
        message: 'Organization deleted successfully',
        timestamp: '2024-01-15T10:30:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Organization not found or organization has users' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing access token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only Admin or Super Admin can delete organizations' })
  async delete(@Param('id') id: string) {
    return (await this.organizationsService.delete(id));
  };

  @Put(':id')
  @UseGuards(AdminAuthGuard, AdminOrSuperAdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Update an organization',
    description: 'Update an organization by ID. All fields in the request body are optional - only provided fields will be updated. Validates that the organization exists. If country_id is provided, validates that the country exists and is active. If city_id is provided, validates that the city exists, is active, and belongs to the specified country (or the organization\'s current country if country_id is not provided). After successful update, the organizations list cache is invalidated. Requires authentication via access_token cookie. Only accessible by Admin or Super Admin roles.'
  })
  @ApiParam({ 
    name: 'id', 
    type: String,
    format: 'uuid',
    description: 'Organization UUID to update',
    example: '323e4567-e89b-12d3-a456-426614174000'
  })
  @ApiBody({ 
    type: UpdateOrganizationDto,
    description: 'Organization update data. All fields are optional - only provided fields will be updated.',
    examples: {
      updateName: {
        summary: 'Update organization name only',
        value: {
          name: 'Updated Tech Solutions Inc.'
        }
      },
      updateStatus: {
        summary: 'Update organization status only',
        value: {
          status: 'INACTIVE'
        }
      },
      updateLocation: {
        summary: 'Update organization location',
        value: {
          country_id: '123e4567-e89b-12d3-a456-426614174000',
          city_id: '223e4567-e89b-12d3-a456-426614174000'
        }
      },
      updateAll: {
        summary: 'Update all organization fields',
        value: {
          name: 'Updated Tech Solutions Inc.',
          country_id: '123e4567-e89b-12d3-a456-426614174000',
          city_id: '223e4567-e89b-12d3-a456-426614174000',
          status: 'ACTIVE'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Organization updated successfully',
    schema: {
      example: {
        success: true,
        message: 'Organization updated successfully',
        data: {
          id: '323e4567-e89b-12d3-a456-426614174000',
          name: 'Updated Tech Solutions Inc.',
          country_id: '123e4567-e89b-12d3-a456-426614174000',
          city_id: '223e4567-e89b-12d3-a456-426614174000',
          status: 'ACTIVE',
          created_at: '2024-01-15T10:30:00.000Z',
          updated_at: '2024-01-15T11:00:00.000Z'
        },
        timestamp: '2024-01-15T11:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Organization not found, country not found, city not found, city does not belong to country, or country/city is inactive' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing access token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only Admin or Super Admin can update organizations' })
  async update(@Param('id') id: string, @Body() updateOrganizationDto: UpdateOrganizationDto) {
    return (await this.organizationsService.update(id, updateOrganizationDto));
  };
}