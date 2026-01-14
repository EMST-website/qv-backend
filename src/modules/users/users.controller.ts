import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  UseGuards,
  Param,
  ParseUUIDPipe,
  Query,
  Put,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { AdminAuthGuard, AdminOrSuperAdminAuthGuard } from '@/common/guards/admin-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { FetchUsersDto } from './dto/fetch-users.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(AdminAuthGuard, AdminOrSuperAdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get all users with pagination and filters',
    description: 'Retrieve a paginated list of users with optional filters by search term (searches first_name and last_name), country_id, city_id, and organization_id. Supports pagination with page and limit parameters. Results are ordered by first_name and last_name in ascending order. Returns users with their associated country, city, and organization data, along with pagination metadata including total count, current page, total pages, and navigation flags. Requires authentication via access_token cookie. Only accessible by Admin or Super Admin roles.'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10, max: 100)', example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search term to filter users by first_name or last_name (partial match)', example: 'John' })
  @ApiQuery({ name: 'country_id', required: false, type: String, format: 'uuid', description: 'Filter users by country UUID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiQuery({ name: 'city_id', required: false, type: String, format: 'uuid', description: 'Filter users by city UUID', example: '223e4567-e89b-12d3-a456-426614174000' })
  @ApiQuery({ name: 'organization_id', required: false, type: String, format: 'uuid', description: 'Filter users by organization UUID', example: '323e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ 
    status: 200, 
    description: 'Users retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Users fetched successfully',
        data: {
          users: [
            {
              id: '423e4567-e89b-12d3-a456-426614174000',
              first_name: 'John',
              last_name: 'Doe',
              email: 'john.doe@example.com',
              phone: '+1234567890',
              gender: 'MALE',
              date_of_birth: '1990-01-15T00:00:00.000Z',
              reward_points: 0,
              status: 'PENDING',
              created_at: '2024-01-15T10:30:00.000Z',
              updated_at: '2024-01-15T10:30:00.000Z',
              country: {
                id: '123e4567-e89b-12d3-a456-426614174000',
                name: 'United States'
              },
              city: {
                id: '223e4567-e89b-12d3-a456-426614174000',
                name: 'New York'
              },
              organization: {
                id: '323e4567-e89b-12d3-a456-426614174000',
                name: 'Tech Solutions Inc.'
              }
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
  @ApiResponse({ status: 403, description: 'Forbidden - Only Admin or Super Admin can view users' })
  async findAll(@Query() query: FetchUsersDto) {
    const filters = {
      page: query.page ? parseInt(query.page.toString()) : 1,
      limit: query.limit ? parseInt(query.limit.toString()) : 10,
      search: query.search ? query.search : undefined,
      country_id: query.country_id ? query.country_id : undefined,
      city_id: query.city_id ? query.city_id : undefined,
      organization_id: query.organization_id ? query.organization_id : undefined,
    };
    return (await this.usersService.findAll(filters));
  }

  @Get(':id')
  @UseGuards(AdminAuthGuard, AdminOrSuperAdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get a user by ID',
    description: 'Retrieve a single user by their UUID. Returns the user with their associated country, city, and organization data. Includes user details such as name, email, phone, gender, date of birth, reward points, status, and timestamps. Requires authentication via access_token cookie. Only accessible by Admin or Super Admin roles.'
  })
  @ApiParam({ 
    name: 'id', 
    type: String,
    format: 'uuid',
    description: 'User UUID',
    example: '423e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'User fetched successfully',
        data: {
          id: '423e4567-e89b-12d3-a456-426614174000',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@example.com',
          phone: '+1234567890',
          gender: 'MALE',
          date_of_birth: '1990-01-15T00:00:00.000Z',
          reward_points: 0,
          status: 'PENDING',
          created_at: '2024-01-15T10:30:00.000Z',
          updated_at: '2024-01-15T10:30:00.000Z',
          country: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            name: 'United States'
          },
          city: {
            id: '223e4567-e89b-12d3-a456-426614174000',
            name: 'New York'
          },
          organization: {
            id: '323e4567-e89b-12d3-a456-426614174000',
            name: 'Tech Solutions Inc.'
          }
        },
        timestamp: '2024-01-15T10:30:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Not Found - User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing access token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only Admin or Super Admin can view users' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return (await this.usersService.findById(id));
  }

  @Post()
  @UseGuards(AdminAuthGuard, AdminOrSuperAdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Create a new user',
    description: 'Create a new user account with email, name, phone, and organization details. Validates that the user does not already exist with the same email or phone. Validates that the organization, country, and city (if provided) exist. Generates a random temporary password and activation token. Sends an activation email to the user with an activation link in the format {user_id}.{activation_token}. The user account is created with PENDING status until activated. Requires authentication via access_token cookie. Only accessible by Admin or Super Admin roles.'
  })
  @ApiBody({ 
    type: CreateUserDto,
    description: 'User creation data. Email, first_name, last_name, phone, country_id, and organization_id are required. Gender, date_of_birth, and city_id are optional.',
    examples: {
      fullUser: {
        summary: 'Create user with all fields',
        value: {
          email: 'john.doe@example.com',
          first_name: 'John',
          last_name: 'Doe',
          phone: '+1234567890',
          gender: 'MALE',
          date_of_birth: '1990-01-15',
          country_id: '123e4567-e89b-12d3-a456-426614174000',
          city_id: '223e4567-e89b-12d3-a456-426614174000',
          organization_id: '323e4567-e89b-12d3-a456-426614174000'
        }
      },
      minimalUser: {
        summary: 'Create user with required fields only',
        value: {
          email: 'jane.smith@example.com',
          first_name: 'Jane',
          last_name: 'Smith',
          phone: '+1987654321',
          country_id: '123e4567-e89b-12d3-a456-426614174000',
          organization_id: '323e4567-e89b-12d3-a456-426614174000'
        }
      },
      femaleUser: {
        summary: 'Create female user',
        value: {
          email: 'sarah.wilson@example.com',
          first_name: 'Sarah',
          last_name: 'Wilson',
          phone: '+1555123456',
          gender: 'FEMALE',
          date_of_birth: '1995-05-20',
          country_id: '123e4567-e89b-12d3-a456-426614174000',
          city_id: '223e4567-e89b-12d3-a456-426614174000',
          organization_id: '323e4567-e89b-12d3-a456-426614174000'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'User created successfully. Activation email sent.',
    schema: {
      example: {
        success: true,
        message: 'User created successfully and activation email sent',
        data: {
          id: '423e4567-e89b-12d3-a456-426614174000',
          email: 'john.doe@example.com',
          first_name: 'John',
          last_name: 'Doe',
          phone: '+1234567890',
          gender: 'MALE',
          date_of_birth: '1990-01-15T00:00:00.000Z',
          reward_points: 0,
          country_id: '123e4567-e89b-12d3-a456-426614174000',
          city_id: '223e4567-e89b-12d3-a456-426614174000',
          organization_id: '323e4567-e89b-12d3-a456-426614174000',
          status: 'PENDING',
          is_profile_completed: false,
          created_at: '2024-01-15T10:30:00.000Z',
          updated_at: '2024-01-15T10:30:00.000Z'
        },
        timestamp: '2024-01-15T10:30:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data, organization not found, country not found, or city not found' })
  @ApiResponse({ status: 409, description: 'Conflict - User already exists with the same email or phone' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing access token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only Admin or Super Admin can create users' })
  async create(@Body() form: CreateUserDto) {
    return ( await this.usersService.create(form));
  }

  @Put(':id')
  @UseGuards(AdminAuthGuard, AdminOrSuperAdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Update a user',
    description: 'Update a user by ID. All fields in the request body are optional - only provided fields will be updated. Validates that the user exists. If country_id is provided, validates that the country exists. If city_id is provided, validates that the city exists and belongs to the specified country (or the user\'s current country if country_id is not provided). If organization_id is provided, validates that the organization exists. Requires authentication via access_token cookie. Only accessible by Admin or Super Admin roles.'
  })
  @ApiParam({ 
    name: 'id', 
    type: String,
    format: 'uuid',
    description: 'User UUID to update',
    example: '423e4567-e89b-12d3-a456-426614174000'
  })
  @ApiBody({ 
    type: UpdateUserDto,
    description: 'User update data. All fields are optional - only provided fields will be updated.',
    examples: {
      updateName: {
        summary: 'Update user name only',
        value: {
          first_name: 'John',
          last_name: 'Smith'
        }
      },
      updateEmail: {
        summary: 'Update user email',
        value: {
          email: 'newemail@example.com'
        }
      },
      updateLocation: {
        summary: 'Update user location',
        value: {
          country_id: '123e4567-e89b-12d3-a456-426614174000',
          city_id: '223e4567-e89b-12d3-a456-426614174000'
        }
      },
      updateOrganization: {
        summary: 'Update user organization',
        value: {
          organization_id: '323e4567-e89b-12d3-a456-426614174000'
        }
      },
      updateAll: {
        summary: 'Update all user fields',
        value: {
          first_name: 'John',
          last_name: 'Smith',
          email: 'john.smith@example.com',
          phone: '+1234567890',
          gender: 'MALE',
          date_of_birth: '1990-01-15',
          country_id: '123e4567-e89b-12d3-a456-426614174000',
          city_id: '223e4567-e89b-12d3-a456-426614174000',
          organization_id: '323e4567-e89b-12d3-a456-426614174000'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User updated successfully',
    schema: {
      example: {
        success: true,
        message: 'User updated successfully',
        data: {
          id: '423e4567-e89b-12d3-a456-426614174000',
          email: 'john.smith@example.com',
          first_name: 'John',
          last_name: 'Smith',
          phone: '+1234567890',
          gender: 'MALE',
          date_of_birth: '1990-01-15T00:00:00.000Z',
          reward_points: 0,
          country_id: '123e4567-e89b-12d3-a456-426614174000',
          city_id: '223e4567-e89b-12d3-a456-426614174000',
          organization_id: '323e4567-e89b-12d3-a456-426614174000',
          status: 'PENDING',
          is_profile_completed: false,
          created_at: '2024-01-15T10:30:00.000Z',
          updated_at: '2024-01-15T11:00:00.000Z'
        },
        timestamp: '2024-01-15T11:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Not Found - User not found' })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data, organization not found, country not found, or city not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing access token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only Admin or Super Admin can update users' })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() form: UpdateUserDto) {
    return (await this.usersService.update(id, form));
  }

  @Delete(':id')
  @UseGuards(AdminAuthGuard, AdminOrSuperAdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Delete a user',
    description: 'Delete a user by ID. Validates that the user exists before deletion. Permanently removes the user from the database. Requires authentication via access_token cookie. Only accessible by Admin or Super Admin roles.'
  })
  @ApiParam({ 
    name: 'id', 
    type: String,
    format: 'uuid',
    description: 'User UUID to delete',
    example: '423e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User deleted successfully',
    schema: {
      example: {
        success: true,
        message: 'User deleted successfully',
        data: {
          id: '423e4567-e89b-12d3-a456-426614174000',
          email: 'john.doe@example.com',
          first_name: 'John',
          last_name: 'Doe',
          phone: '+1234567890',
          gender: 'MALE',
          date_of_birth: '1990-01-15T00:00:00.000Z',
          reward_points: 0,
          country_id: '123e4567-e89b-12d3-a456-426614174000',
          city_id: '223e4567-e89b-12d3-a456-426614174000',
          organization_id: '323e4567-e89b-12d3-a456-426614174000',
          status: 'PENDING',
          is_profile_completed: false,
          created_at: '2024-01-15T10:30:00.000Z',
          updated_at: '2024-01-15T10:30:00.000Z'
        },
        timestamp: '2024-01-15T11:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Not Found - User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing access token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only Admin or Super Admin can delete users' })
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return (await this.usersService.delete(id));
  }
}
