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
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'Returns all users with their organizations',
  })
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
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the user with organization',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return (await this.usersService.findById(id));
  }

  @Post()
  @UseGuards(AdminAuthGuard, AdminOrSuperAdminAuthGuard)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'User created successfully. Activation email sent.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async create(@Body() form: CreateUserDto) {
    return ( await this.usersService.create(form));
  }

  @Put(':id')
  @UseGuards(AdminAuthGuard, AdminOrSuperAdminAuthGuard)
  @ApiOperation({ summary: 'Update a user' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() form: UpdateUserDto) {
    return (await this.usersService.update(id, form));
  }

  @Delete(':id')
  @UseGuards(AdminAuthGuard, AdminOrSuperAdminAuthGuard)
  @ApiOperation({ summary: 'Delete a user' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return (await this.usersService.delete(id));
  }
}
