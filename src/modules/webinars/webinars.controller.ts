import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { WebinarsService } from './webinars.service';
import { CreateWebinarDto } from './dto/create-webinar.dto';
import { UpdateWebinarDto } from './dto/update-webinar.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('webinars')
@Controller('webinars')
export class WebinarsController {
  constructor(private readonly webinarsService: WebinarsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a webinar' })
  @ApiBody({ type: CreateWebinarDto })
  @ApiResponse({ status: 201, description: 'Webinar created successfully' })
  create(@Body() createWebinarDto: CreateWebinarDto) {
    return this.webinarsService.create(createWebinarDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all webinars' })
  @ApiQuery({
    name: 'country',
    required: false,
    description: 'Filter by country code (e.g. AE)',
  })
  @ApiResponse({ status: 200, description: 'Return all webinars' })
  findAll(@Query('country') country?: string) {
    return this.webinarsService.findAll(country);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a webinar by ID' })
  @ApiParam({ name: 'id', description: 'Webinar UUID' })
  @ApiResponse({ status: 200, description: 'Return the webinar' })
  @ApiResponse({ status: 404, description: 'Webinar not found' })
  findOne(@Param('id') id: string) {
    return this.webinarsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a webinar' })
  @ApiParam({ name: 'id', description: 'Webinar UUID' })
  @ApiBody({ type: UpdateWebinarDto })
  @ApiResponse({ status: 200, description: 'Webinar updated successfully' })
  update(@Param('id') id: string, @Body() updateWebinarDto: UpdateWebinarDto) {
    return this.webinarsService.update(id, updateWebinarDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a webinar' })
  @ApiParam({ name: 'id', description: 'Webinar UUID' })
  @ApiResponse({ status: 200, description: 'Webinar deleted successfully' })
  remove(@Param('id') id: string) {
    return this.webinarsService.remove(id);
  }

  @Post(':id/register')
  @ApiOperation({ summary: 'Register for a webinar' })
  @ApiParam({ name: 'id', description: 'Webinar UUID' })
  @ApiBody({
    schema: { type: 'object', properties: { userId: { type: 'string' } } },
  })
  register(@Param('id') id: string, @Body('userId') userId: string) {
    return this.webinarsService.register(id, userId);
  }
}
