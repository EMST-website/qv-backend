import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
} from '@nestjs/common';
import { WebinarsService } from './webinars.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('webinars')
@Controller('webinars')
export class WebinarsController {
  constructor(private readonly webinarsService: WebinarsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a webinar' })
  @ApiResponse({ status: 201, description: 'Webinar created successfully' })
  create() {
    return this.webinarsService.create();
  }

  @Get()
  @ApiOperation({ summary: 'Get all webinars' })
  @ApiQuery({
    name: 'country',
    required: false,
    description: 'Filter by country code (e.g. AE)',
  })
  @ApiResponse({ status: 200, description: 'Return all webinars' })
  findAll() {
    return this.webinarsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a webinar by ID' })
  @ApiParam({ name: 'id', description: 'Webinar UUID' })
  @ApiResponse({ status: 200, description: 'Return the webinar' })
  @ApiResponse({ status: 404, description: 'Webinar not found' })
  findOne() {
    return this.webinarsService.findOne();
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a webinar' })
  @ApiParam({ name: 'id', description: 'Webinar UUID' })
  @ApiResponse({ status: 200, description: 'Webinar updated successfully' })
  update() {
    return this.webinarsService.update();
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a webinar' })
  @ApiParam({ name: 'id', description: 'Webinar UUID' })
  @ApiResponse({ status: 200, description: 'Webinar deleted successfully' })
  remove() {
    return this.webinarsService.remove();
  }

  @Post(':id/register')
  @ApiOperation({ summary: 'Register for a webinar' })
  @ApiParam({ name: 'id', description: 'Webinar UUID' })
  register() {
    return this.webinarsService.register();
  }
}
