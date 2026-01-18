import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '@/database/database.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@/database/schema';
import { REDIS_CLIENT } from '@/cache/cache.service';
import { Redis } from 'ioredis';
import { CreateCountryDto } from './dto/create-country.dto';
import { and, asc, count, eq, ilike } from 'drizzle-orm';
import { countries, CountryStatusEnum } from './schema/countries.schema';
import { cities as citiesSchema } from './schema/cities.schema';
import { CityStatusEnum } from './schema/cities.schema';
import { successResponse } from '@/common/utils/response/response';
import { UpdateCountriesDto } from './dto/update-countries.dto';
import { users as usersSchema } from '../users/schema/users.schema';
import { organizations as organizationsSchema } from '../organizations/organizations.schema';
import { UpdateCityDto } from './dto/update-city.dto';
import { CreateCityDto } from './dto/create-city.dto';


@Injectable()
export class CountriesService {
   constructor(
      @Inject(DATABASE_CONNECTION)
      private readonly db: NodePgDatabase<typeof schema>,
      @Inject(REDIS_CLIENT)
      private readonly cache: Redis,
   ) { };

   async createCountry(body: CreateCountryDto) {
      const { name, status, cities } = body;

      // check if the country already exists
      const country = await this.db.query.countries.findFirst({
         where: eq(countries.name, name),
      });
      if (country)
         throw new BadRequestException('Country already exists');

      // create the country
      const result = await this.db.transaction(async (tx) => {
         const countryRecord = await tx.insert(countries).values({
            name,
            status,
         }).returning({
            id: countries.id,
            name: countries.name,
            status: countries.status,
         });
         if (!countryRecord)
            throw new BadRequestException('Failed to create country');

         const cityRecords: {
            id: string;
            name: string;
            status: CityStatusEnum | null;
         }[] = [];
         if (cities && cities.length > 0) {
            for (const city of cities) {
               const cityRecord = await tx.insert(citiesSchema).values({
                  name: city.name,
                  status: city.status,
                  country_id: countryRecord[0].id,
               }).returning({
                  id: citiesSchema.id,
                  name: citiesSchema.name,
                  status: citiesSchema.status,
               }).then((result) => result[0]);
               if (!cityRecord)
                  throw new BadRequestException('Failed to create city');
               cityRecords.push({
                  id: cityRecord.id,
                  name: cityRecord.name,
                  status: cityRecord.status,
               });
            }
         }

         // delete the countries dropdown data from the cache
         await this.cache.del('countries_list');
         // return the result

         return ({
            country: countryRecord[0],
            cities: cityRecords.map((city) => ({
               id: city.id,
               name: city.name,
               status: city.status,
            })),
         });
      });

      return (successResponse('Country created successfully in database', {
         id: result.country.id,
         name: result.country.name,
         status: result.country.status,
         cities: result.cities.map((city) => ({
            id: city.id,
            name: city.name,
            status: city.status,
         })),
      }));
   };

   async list() {
      // get the coutries dropdown data from the cache
      const countries_cache = await this.cache.get('countries_list');
      if (countries_cache)
         return (successResponse('Countries fetched successfully from cache', {
            countries: JSON.parse(countries_cache),
         }));

      // get the countries from the database
      const countries_db = await this.db.query.countries.findMany({
         where: eq(countries.status, 'ACTIVE'),
         with: {
            cities: {
               where: eq(citiesSchema.status, 'ACTIVE'),
               orderBy: [asc(citiesSchema.name)],
               columns: {
                  id: true,
                  name: true
               }
            },
         },
         columns: {
            id: true,
            name: true
         },
         orderBy: [asc(countries.name)],
      });

      // set the countries dropdown data to the cache
      await this.cache.set('countries_list', JSON.stringify(countries_db)); // without time limit
      // return the countries dropdown data
      return (successResponse('Countries fetched successfully from database', {
         countries: countries_db.map((country) => ({
            id: country.id,
            name: country.name,
            cities: (country.cities as { id: string; name: string }[]).map((city) => ({
               id: city.id,
               name: city.name,
            })),
         })),
      }));
   };

   public async fetchCountries(filters: {
      page: number;
      limit: number;
      search?: string;
      status?: CountryStatusEnum;
   }) {
      // destructuring the filters
      const { page, limit, search, status } = filters;

      // get the countries from the database, and the total number of countries
      const [countries_db, total] = await Promise.all([
         this.db.query.countries.findMany({
            where: and(
               ...(search ? [ilike(countries.name, `%${search.toLowerCase().trim()}%`)] : []),
               ...(status ? [eq(countries.status, status)] : []),
            ),
            offset: (page - 1) * limit,
            limit: limit,
            orderBy: [asc(countries.name)],
            columns: {
               id: true,
               name: true,
               status: true,
               created_at: true,
               updated_at: true
            },
         }),
         this.db.select({
            count: count()
         }).from(countries).where(and(
            ...(search ? [ilike(countries.name, `%${search.toLowerCase().trim()}%`)] : []),
            ...(status ? [eq(countries.status, status)] : []),
         )).then(result => result[0].count)
      ]);

      // prepare the result
      const result = {
         countries: countries_db,
         pagination: {
            total,
            current_page: page,
            total_pages: Math.ceil(total / limit),
            has_next_page: page < Math.ceil(total / limit),
            has_previous_page: page > 1,
         }
      }

      // return the result
      return (successResponse('Countries fetched successfully', result));
   };

   public async updateCountry(id: string, body: UpdateCountriesDto) {
      const { name, status } = body;

      // check if the country already exists
      const country = await this.db.query.countries.findFirst({
         where: eq(countries.id, id),
      });
      if (!country)
         throw new BadRequestException('Country not found');

      // update the country
      const result = await this.db.update(countries).set({
         name: name ? name : undefined,
         status: status ? status : undefined,
      }).where(eq(countries.id, id)).returning({
         id: countries.id,
         name: countries.name,
         status: countries.status,
      });
      if (!result)
         throw new BadRequestException('Failed to update country');

      // delete the countries dropdown data from the cache
      await this.cache.del('countries_list');
      // return the result
      return (successResponse('Country updated successfully', {
         id: result[0].id,
         name: result[0].name,
         status: result[0].status,
      }));
   };

   public async deleteCountry(id: string) {
      // check if the country exists
      const country = await this.db.query.countries.findFirst({
         where: eq(countries.id, id),
      });
      if (!country)
         throw new BadRequestException('Country not found');

      // check if the country has any cities, users, or organizations
      const [cities, users, organizations] = await Promise.all([
         this.db.query.cities.findMany({
            where: eq(citiesSchema.country_id, id),
         }),
         this.db.query.users.findMany({
            where: eq(usersSchema.country_id, id),
         }),
         this.db.query.organizations.findMany({
            where: eq(organizationsSchema.country_id, id),
         }),
      ]);
      if (cities && cities.length > 0)
         throw new BadRequestException('Country has cities, please delete the cities first');
      if (users && users.length > 0)
         throw new BadRequestException('Country has users, please delete the users first');
      if (organizations && organizations.length > 0)
         throw new BadRequestException('Country has organizations, please delete the organizations first');

      // delete the country
      const result = await this.db.delete(countries).where(eq(countries.id, id));
      if (!result)
         throw new BadRequestException('Failed to delete country');

      // delete the countries dropdown data from the cache
      await this.cache.del('countries_list');
      // return the result
      return (successResponse('Country deleted successfully'));
   };

   public async deleteCountryCity(id: string, city_id: string) {
      // check if the country exists
      const country = await this.db.query.countries.findFirst({
         where: eq(countries.id, id),
      });
      if (!country)
         throw new BadRequestException('Country not found');

      // check if the city exists
      const city = await this.db.query.cities.findFirst({
         where: eq(citiesSchema.id, city_id),
      });
      if (!city)
         throw new BadRequestException('City not found');
      if (city.country_id !== id)
         throw new BadRequestException('City does not belong to the country');

      // check if the city has any users
      const [users] = await Promise.all([
         this.db.query.users.findMany({
            where: eq(usersSchema.city_id, city_id),
         }),
      ]);
      if (users && users.length > 0)
         throw new BadRequestException('City has users, please delete the users first');

      // delete the city
      const result = await this.db.delete(citiesSchema).where(eq(citiesSchema.id, city_id));
      if (!result)
         throw new BadRequestException('Failed to delete city');

      // delete the countries dropdown data from the cache
      await this.cache.del('countries_list');
      // return the result
      return (successResponse('City deleted successfully'));
   };

   public async updateCity(id: string, city_id: string, body: UpdateCityDto) {
      const { name, status } = body;

      // check if the city exists
      const city = await this.db.query.cities.findFirst({
         where: eq(citiesSchema.id, city_id),
      });
      if (!city)
         throw new BadRequestException('City not found');
      if (city.country_id !== id)
         throw new BadRequestException('City does not belong to the country');

      // update the city
      const result = await this.db.update(citiesSchema).set({
         name: name ? name : undefined,
         status: status ? status : undefined,
      }).where(eq(citiesSchema.id, city_id)).returning({
         id: citiesSchema.id,
         name: citiesSchema.name,
         status: citiesSchema.status,
      });
      if (!result)
         throw new BadRequestException('Failed to update city');

      // delete the countries dropdown data from the cache
      await this.cache.del('countries_list');
      // return the result
      return (successResponse('City updated successfully', {
         id: result[0].id,
         name: result[0].name,
         status: result[0].status,
      }));
   };

   public async createCity(id: string, body: CreateCityDto) {
      const { name, status } = body;

      // check if the country exists
      const country = await this.db.query.countries.findFirst({
         where: eq(countries.id, id),
      });
      if (!country)
         throw new BadRequestException('Country not found');

      // check if the city already exists
      const city = await this.db.query.cities.findFirst({
         where: and(
            eq(citiesSchema.name, name),
            eq(citiesSchema.country_id, id),
         ),
      });
      if (city)
         throw new BadRequestException('City already exists, please update the city instead');

      // create the city
      const result = await this.db.insert(citiesSchema).values({
         name,
         status: status ? status : 'ACTIVE',
         country_id: id,
      }).returning({
         id: citiesSchema.id,
         name: citiesSchema.name,
         status: citiesSchema.status,
      }).then((result) => result[0]);
      if (!result)
         throw new BadRequestException('Failed to create city');

      // delete the countries dropdown data from the cache
      await this.cache.del('countries_list');
      // return the result
      return (successResponse('City created successfully', {
         id: result.id,
         name: result.name,
         status: result.status,
      }));
   };

   public async fetchCountry(id: string) {
      // check if the country exists
      const country = await this.db.query.countries.findFirst({
         where: eq(countries.id, id),
         with: {
            cities: {
               columns: {
                  id: true,
                  name: true,
                  status: true,
               }
            }
         }
      });
      if (!country)
         throw new BadRequestException('Country not found');

      // return the result
      return (successResponse('Country fetched successfully', {
         id: country.id,
         name: country.name,
         status: country.status,
         cities: country.cities.map((city) => ({
            id: city.id,
            name: city.name,
            status: city.status,
         })),
      }));
   };

   /**
    * Find country and city by ID - used to fetch countries and cities for any service that needs it
    * @param id - Country ID
    * @param city_id - City ID
    * @returns country and city objects
    */
   public async findById(id: string, city_id?: string) {
      // find country by id and the function will throw an error if not found
      const country = await this.db.query.countries.findFirst({
         where: eq(countries.id, id),
      });
      if (!country)
         throw (new NotFoundException('Country not found'));

      if (city_id) {
         // find city by id and the function will throw an error if not found
         const city = await this.db.query.cities.findFirst({
            where: eq(citiesSchema.id, city_id),
         });
         if (!city)
            throw (new NotFoundException('City not found'));

         return ({
            country,
            city: {
               id: city.id,
               name: city.name,
               status: city.status,
            },
         });
      }

      // return the result
      return ({
         country,
         city: null,
      });
   }
};
