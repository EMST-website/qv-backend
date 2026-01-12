import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query, UseGuards } from "@nestjs/common";
import { CountriesService } from "./countries.service";
import { CreateCountryDto } from "./dto/create-country.dto";
import { AdminAuthGuard, AdminOrSuperAdminAuthGuard } from "@/common/guards/admin-auth.guard";
import type { CountryStatusEnum } from "./schema/countries.schema";
import { FetchCountriesDto } from "./dto/fetch-countries.dto";
import { UpdateCountriesDto } from "./dto/update-countries.dto";
import { UpdateCityDto } from "./dto/update-city.dto";
import { CreateCityDto } from "./dto/create-city.dto";



@Controller('countries')
export class CountriesController {
   constructor(
      private readonly countriesService: CountriesService
   ) {};

   @Post('')
   @UseGuards(AdminAuthGuard, AdminOrSuperAdminAuthGuard)
   async createCountry(@Body() body: CreateCountryDto) {
      return (await this.countriesService.createCountry(body));
   };

   @Get('')
   @UseGuards(AdminAuthGuard, AdminOrSuperAdminAuthGuard)
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
   async list() {
      return (await this.countriesService.list());
   };

   @Get(':id')
   @UseGuards(AdminAuthGuard, AdminOrSuperAdminAuthGuard)
   async fetchCountry(@Param('id', ParseUUIDPipe) id: string) {
      return (await this.countriesService.fetchCountry(id));
   };

   @Put(':id')
   @UseGuards(AdminAuthGuard, AdminOrSuperAdminAuthGuard)
   async updateCountry(
      @Param('id', ParseUUIDPipe) id: string,
      @Body() body: UpdateCountriesDto
   ) {
      return (await this.countriesService.updateCountry(id, body));
   };

   @Delete(':id')
   @UseGuards(AdminAuthGuard, AdminOrSuperAdminAuthGuard)
   async deleteCountry(@Param('id', ParseUUIDPipe) id: string) {
      return (await this.countriesService.deleteCountry(id));
   };

   @Post(':id/cities')
   @UseGuards(AdminAuthGuard, AdminOrSuperAdminAuthGuard)
   async createCity(
      @Param('id', ParseUUIDPipe) id: string,
      @Body() body: CreateCityDto
   ) {
      return (await this.countriesService.createCity(id, body));
   };

   @Delete(':id/cities/:city_id')
   @UseGuards(AdminAuthGuard, AdminOrSuperAdminAuthGuard)
   async deleteCountryCities(
      @Param('id', ParseUUIDPipe) id: string,
      @Param('city_id', ParseUUIDPipe) city_id: string
   ) {
      return (await this.countriesService.deleteCountryCity(id, city_id));
   };

   @Put(':id/cities/:city_id/')
   @UseGuards(AdminAuthGuard, AdminOrSuperAdminAuthGuard)
   async updateCity(
      @Param('id', ParseUUIDPipe) id: string,
      @Param('city_id', ParseUUIDPipe) city_id: string,
      @Body() body: UpdateCityDto
   ) {
      return (await this.countriesService.updateCity(id, city_id, body));
   };
};
