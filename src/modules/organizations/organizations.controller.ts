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
  async create(@Body() createOrganizationDto: CreateOrganizationDto) {
    return (await this.organizationsService.create(createOrganizationDto));
  };

  @Get('')
  @UseGuards(AdminAuthGuard, AdminOrSuperAdminAuthGuard)
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
  async fetchList() {
    return (await this.organizationsService.fetchList());
  };

  @Delete(':id')
  @UseGuards(AdminAuthGuard, AdminOrSuperAdminAuthGuard)
  async delete(@Param('id') id: string) {
    return (await this.organizationsService.delete(id));
  };

  @Put(':id')
  @UseGuards(AdminAuthGuard, AdminOrSuperAdminAuthGuard)
  async update(@Param('id') id: string, @Body() updateOrganizationDto: UpdateOrganizationDto) {
    return (await this.organizationsService.update(id, updateOrganizationDto));
  };
}