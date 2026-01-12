import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query, UseGuards } from "@nestjs/common";
import { CountriesService } from "./countries.service";
import { CreateCountryDto } from "./dto/create-country.dto";
import { AdminAuthGuard, AdminOrSuperAdminAuthGuard } from "@/common/guards/admin-auth.guard";
import type { CountryStatusEnum } from "./schema/countries.schema";
import { FetchCountriesDto } from "./dto/fetch-countries.dto";
import { UpdateCountriesDto } from "./dto/update-countries.dto";
import { UpdateCityDto } from "./dto/update-city.dto";
import { CreateCityDto } from "./dto/create-city.dto";
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery, ApiParam, ApiBearerAuth } from "@nestjs/swagger";

@ApiTags('countries')
@Controller('countries')
export class CountriesController {
   constructor(
      private readonly countriesService: CountriesService
   ) {};

   @Post('')
   @UseGuards(AdminAuthGuard, AdminOrSuperAdminAuthGuard)
   @ApiBearerAuth()
   @ApiOperation({ 
      summary: 'Create a new country',
      description: 'Create a new country with optional cities. If cities are provided, they will be created along with the country in a transaction. Requires authentication via access_token cookie. Only accessible by Admin or Super Admin roles.'
   })
   @ApiBody({ 
      type: CreateCountryDto,
      description: 'Country creation data. Cities array is optional.',
      examples: {
         countryOnly: {
            summary: 'Create country without cities',
            value: {
               name: 'United Arab Emirates',
               status: 'ACTIVE'
            }
         },
         countryWithCities: {
            summary: 'Create country with cities',
            value: {
               name: 'United Arab Emirates',
               status: 'ACTIVE',
               cities: [
                  { name: 'Dubai', status: 'ACTIVE' },
                  { name: 'Abu Dhabi', status: 'ACTIVE' }
               ]
            }
         }
      }
   })
   @ApiResponse({ 
      status: 201, 
      description: 'Country created successfully',
      schema: {
         example: {
            success: true,
            message: 'Country created successfully in database',
            data: {
               id: '123e4567-e89b-12d3-a456-426614174000',
               name: 'United Arab Emirates',
               status: 'ACTIVE',
               cities: [
                  {
                     id: '223e4567-e89b-12d3-a456-426614174000',
                     name: 'Dubai',
                     status: 'ACTIVE'
                  },
                  {
                     id: '323e4567-e89b-12d3-a456-426614174000',
                     name: 'Abu Dhabi',
                     status: 'ACTIVE'
                  }
               ]
            },
            timestamp: '2024-01-15T10:30:00.000Z'
         }
      }
   })
   @ApiResponse({ status: 400, description: 'Bad Request - Country already exists, validation error, or failed to create country/cities' })
   @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing access token' })
   @ApiResponse({ status: 403, description: 'Forbidden - Only Admin or Super Admin can create countries' })
   async createCountry(@Body() body: CreateCountryDto) {
      return (await this.countriesService.createCountry(body));
   };

   @Get('')
   @UseGuards(AdminAuthGuard, AdminOrSuperAdminAuthGuard)
   @ApiBearerAuth()
   @ApiOperation({ 
      summary: 'Get all countries with pagination and filters',
      description: 'Retrieve a paginated list of countries with optional search and status filters. Supports pagination with page and limit parameters. Requires authentication via access_token cookie. Only accessible by Admin or Super Admin roles.'
   })
   @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)', example: 1 })
   @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)', example: 10 })
   @ApiQuery({ name: 'search', required: false, type: String, description: 'Search countries by name (partial match)', example: 'United' })
   @ApiQuery({ name: 'status', required: false, enum: ['ACTIVE', 'INACTIVE'], description: 'Filter by country status', example: 'ACTIVE' })
   @ApiResponse({ 
      status: 200, 
      description: 'Countries retrieved successfully',
      schema: {
         example: {
            success: true,
            message: 'Countries fetched successfully',
            data: {
               countries: [
                  {
                     id: '123e4567-e89b-12d3-a456-426614174000',
                     name: 'United Arab Emirates',
                     status: 'ACTIVE',
                     created_at: '2024-01-01T00:00:00.000Z',
                     updated_at: '2024-01-01T00:00:00.000Z'
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
   @ApiResponse({ status: 403, description: 'Forbidden - Only Admin or Super Admin can view countries' })
   async fetchCountries(@Query() query: FetchCountriesDto) {
      const filters = {
         page: query.page ? parseInt(query.page.toString()) : 1,
         limit: query.limit ? parseInt(query.limit.toString()) : 10,
         search: query.search,
         status: query.status as CountryStatusEnum,
      }
      return (await this.countriesService.fetchCountries(filters));
   };

   @Get('list')
   @UseGuards(AdminAuthGuard, AdminOrSuperAdminAuthGuard)
   @ApiBearerAuth()
   @ApiOperation({ 
      summary: 'Get active countries list for dropdown',
      description: 'Retrieve a cached list of active countries with their active cities. This endpoint is optimized for dropdown/select components. Data is cached in Redis for performance. Returns only ACTIVE countries and their ACTIVE cities. Requires authentication via access_token cookie. Only accessible by Admin or Super Admin roles.'
   })
   @ApiResponse({ 
      status: 200, 
      description: 'Countries list retrieved successfully (from cache or database)',
      schema: {
         example: {
            success: true,
            message: 'Countries fetched successfully from cache',
            data: {
               countries: [
                  {
                     id: '123e4567-e89b-12d3-a456-426614174000',
                     name: 'United Arab Emirates',
                     cities: [
                        {
                           id: '223e4567-e89b-12d3-a456-426614174000',
                           name: 'Dubai'
                        },
                        {
                           id: '323e4567-e89b-12d3-a456-426614174000',
                           name: 'Abu Dhabi'
                        }
                     ]
                  }
               ]
            },
            timestamp: '2024-01-15T10:30:00.000Z'
         }
      }
   })
   @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing access token' })
   @ApiResponse({ status: 403, description: 'Forbidden - Only Admin or Super Admin can view countries list' })
   async list() {
      return (await this.countriesService.list());
   };

   @Get(':id')
   @UseGuards(AdminAuthGuard, AdminOrSuperAdminAuthGuard)
   @ApiBearerAuth()
   @ApiOperation({ 
      summary: 'Get a country by ID',
      description: 'Retrieve a single country by its UUID along with all its cities (regardless of status). Requires authentication via access_token cookie. Only accessible by Admin or Super Admin roles.'
   })
   @ApiParam({ 
      name: 'id', 
      description: 'Country UUID',
      type: String,
      example: '123e4567-e89b-12d3-a456-426614174000'
   })
   @ApiResponse({ 
      status: 200, 
      description: 'Country retrieved successfully',
      schema: {
         example: {
            success: true,
            message: 'Country fetched successfully',
            data: {
               id: '123e4567-e89b-12d3-a456-426614174000',
               name: 'United Arab Emirates',
               status: 'ACTIVE',
               cities: [
                  {
                     id: '223e4567-e89b-12d3-a456-426614174000',
                     name: 'Dubai',
                     status: 'ACTIVE'
                  },
                  {
                     id: '323e4567-e89b-12d3-a456-426614174000',
                     name: 'Abu Dhabi',
                     status: 'ACTIVE'
                  }
               ]
            },
            timestamp: '2024-01-15T10:30:00.000Z'
         }
      }
   })
   @ApiResponse({ status: 400, description: 'Bad Request - Country not found' })
   @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing access token' })
   @ApiResponse({ status: 403, description: 'Forbidden - Only Admin or Super Admin can view countries' })
   async fetchCountry(@Param('id', ParseUUIDPipe) id: string) {
      return (await this.countriesService.fetchCountry(id));
   };

   @Put(':id')
   @UseGuards(AdminAuthGuard, AdminOrSuperAdminAuthGuard)
   @ApiBearerAuth()
   @ApiOperation({ 
      summary: 'Update a country by ID',
      description: 'Update a country\'s name and/or status. All fields are optional - only provided fields will be updated. Invalidates the countries list cache. Requires authentication via access_token cookie. Only accessible by Admin or Super Admin roles.'
   })
   @ApiParam({ 
      name: 'id', 
      description: 'Country UUID to update',
      type: String,
      example: '123e4567-e89b-12d3-a456-426614174000'
   })
   @ApiBody({ 
      type: UpdateCountriesDto,
      description: 'Country update data. All fields are optional.',
      examples: {
         updateName: {
            summary: 'Update name only',
            value: {
               name: 'UAE'
            }
         },
         updateStatus: {
            summary: 'Update status only',
            value: {
               status: 'INACTIVE'
            }
         },
         updateBoth: {
            summary: 'Update both fields',
            value: {
               name: 'United Arab Emirates',
               status: 'ACTIVE'
            }
         }
      }
   })
   @ApiResponse({ 
      status: 200, 
      description: 'Country updated successfully',
      schema: {
         example: {
            success: true,
            message: 'Country updated successfully',
            data: {
               id: '123e4567-e89b-12d3-a456-426614174000',
               name: 'United Arab Emirates',
               status: 'ACTIVE'
            },
            timestamp: '2024-01-15T10:30:00.000Z'
         }
      }
   })
   @ApiResponse({ status: 400, description: 'Bad Request - Country not found, validation error (name min 3, max 255 characters), or failed to update' })
   @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing access token' })
   @ApiResponse({ status: 403, description: 'Forbidden - Only Admin or Super Admin can update countries' })
   async updateCountry(
      @Param('id', ParseUUIDPipe) id: string,
      @Body() body: UpdateCountriesDto
   ) {
      return (await this.countriesService.updateCountry(id, body));
   };

   @Delete(':id')
   @UseGuards(AdminAuthGuard, AdminOrSuperAdminAuthGuard)
   @ApiBearerAuth()
   @ApiOperation({ 
      summary: 'Delete a country by ID',
      description: 'Permanently delete a country. The country cannot be deleted if it has associated cities, users, or organizations. This action is irreversible and invalidates the countries list cache. Requires authentication via access_token cookie. Only accessible by Admin or Super Admin roles.'
   })
   @ApiParam({ 
      name: 'id', 
      description: 'Country UUID to delete',
      type: String,
      example: '123e4567-e89b-12d3-a456-426614174000'
   })
   @ApiResponse({ 
      status: 200, 
      description: 'Country deleted successfully',
      schema: {
         example: {
            success: true,
            message: 'Country deleted successfully',
            timestamp: '2024-01-15T10:30:00.000Z'
         }
      }
   })
   @ApiResponse({ status: 400, description: 'Bad Request - Country not found, or country has associated cities/users/organizations that must be deleted first' })
   @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing access token' })
   @ApiResponse({ status: 403, description: 'Forbidden - Only Admin or Super Admin can delete countries' })
   async deleteCountry(@Param('id', ParseUUIDPipe) id: string) {
      return (await this.countriesService.deleteCountry(id));
   };

   @Post(':id/cities')
   @UseGuards(AdminAuthGuard, AdminOrSuperAdminAuthGuard)
   @ApiBearerAuth()
   @ApiOperation({ 
      summary: 'Create a new city for a country',
      description: 'Create a new city for a specific country. The city name must be unique within the country. Status defaults to ACTIVE if not provided. Invalidates the countries list cache. Requires authentication via access_token cookie. Only accessible by Admin or Super Admin roles.'
   })
   @ApiParam({ 
      name: 'id', 
      description: 'Country UUID to add the city to',
      type: String,
      example: '123e4567-e89b-12d3-a456-426614174000'
   })
   @ApiBody({ 
      type: CreateCityDto,
      description: 'City creation data. Status is optional and defaults to ACTIVE.',
      examples: {
         withStatus: {
            summary: 'Create city with status',
            value: {
               name: 'Dubai',
               status: 'ACTIVE'
            }
         },
         withoutStatus: {
            summary: 'Create city without status (defaults to ACTIVE)',
            value: {
               name: 'Dubai'
            }
         }
      }
   })
   @ApiResponse({ 
      status: 201, 
      description: 'City created successfully',
      schema: {
         example: {
            success: true,
            message: 'City created successfully',
            data: {
               id: '223e4567-e89b-12d3-a456-426614174000',
               name: 'Dubai',
               status: 'ACTIVE'
            },
            timestamp: '2024-01-15T10:30:00.000Z'
         }
      }
   })
   @ApiResponse({ status: 400, description: 'Bad Request - Country not found, city already exists, validation error, or failed to create city' })
   @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing access token' })
   @ApiResponse({ status: 403, description: 'Forbidden - Only Admin or Super Admin can create cities' })
   async createCity(
      @Param('id', ParseUUIDPipe) id: string,
      @Body() body: CreateCityDto
   ) {
      return (await this.countriesService.createCity(id, body));
   };

   @Delete(':id/cities/:city_id')
   @UseGuards(AdminAuthGuard, AdminOrSuperAdminAuthGuard)
   @ApiBearerAuth()
   @ApiOperation({ 
      summary: 'Delete a city from a country',
      description: 'Permanently delete a city from a country. The city cannot be deleted if it has associated users. This action is irreversible and invalidates the countries list cache. Requires authentication via access_token cookie. Only accessible by Admin or Super Admin roles.'
   })
   @ApiParam({ 
      name: 'id', 
      description: 'Country UUID',
      type: String,
      example: '123e4567-e89b-12d3-a456-426614174000'
   })
   @ApiParam({ 
      name: 'city_id', 
      description: 'City UUID to delete',
      type: String,
      example: '223e4567-e89b-12d3-a456-426614174000'
   })
   @ApiResponse({ 
      status: 200, 
      description: 'City deleted successfully',
      schema: {
         example: {
            success: true,
            message: 'City deleted successfully',
            timestamp: '2024-01-15T10:30:00.000Z'
         }
      }
   })
   @ApiResponse({ status: 400, description: 'Bad Request - Country not found, city not found, city does not belong to the country, or city has associated users that must be deleted first' })
   @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing access token' })
   @ApiResponse({ status: 403, description: 'Forbidden - Only Admin or Super Admin can delete cities' })
   async deleteCountryCities(
      @Param('id', ParseUUIDPipe) id: string,
      @Param('city_id', ParseUUIDPipe) city_id: string
   ) {
      return (await this.countriesService.deleteCountryCity(id, city_id));
   };

   @Put(':id/cities/:city_id/')
   @UseGuards(AdminAuthGuard, AdminOrSuperAdminAuthGuard)
   @ApiBearerAuth()
   @ApiOperation({ 
      summary: 'Update a city in a country',
      description: 'Update a city\'s name and/or status. All fields are optional - only provided fields will be updated. Verifies that the city belongs to the specified country. Invalidates the countries list cache. Requires authentication via access_token cookie. Only accessible by Admin or Super Admin roles.'
   })
   @ApiParam({ 
      name: 'id', 
      description: 'Country UUID',
      type: String,
      example: '123e4567-e89b-12d3-a456-426614174000'
   })
   @ApiParam({ 
      name: 'city_id', 
      description: 'City UUID to update',
      type: String,
      example: '223e4567-e89b-12d3-a456-426614174000'
   })
   @ApiBody({ 
      type: UpdateCityDto,
      description: 'City update data. All fields are optional.',
      examples: {
         updateName: {
            summary: 'Update name only',
            value: {
               name: 'Dubai City'
            }
         },
         updateStatus: {
            summary: 'Update status only',
            value: {
               status: 'INACTIVE'
            }
         },
         updateBoth: {
            summary: 'Update both fields',
            value: {
               name: 'Dubai',
               status: 'ACTIVE'
            }
         }
      }
   })
   @ApiResponse({ 
      status: 200, 
      description: 'City updated successfully',
      schema: {
         example: {
            success: true,
            message: 'City updated successfully',
            data: {
               id: '223e4567-e89b-12d3-a456-426614174000',
               name: 'Dubai',
               status: 'ACTIVE'
            },
            timestamp: '2024-01-15T10:30:00.000Z'
         }
      }
   })
   @ApiResponse({ status: 400, description: 'Bad Request - Country not found, city not found, city does not belong to the country, validation error, or failed to update' })
   @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing access token' })
   @ApiResponse({ status: 403, description: 'Forbidden - Only Admin or Super Admin can update cities' })
   async updateCity(
      @Param('id', ParseUUIDPipe) id: string,
      @Param('city_id', ParseUUIDPipe) city_id: string,
      @Body() body: UpdateCityDto
   ) {
      return (await this.countriesService.updateCity(id, city_id, body));
   };
};
