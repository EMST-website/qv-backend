import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { DATABASE_CONNECTION } from '@/database/database.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@/database/schema';
import { REDIS_CLIENT } from '@/cache/cache.service';
import { Redis } from 'ioredis';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { cities, countries, organizations, users } from '@/database/schema';
import { and, asc, count, desc, eq, ilike } from 'drizzle-orm';
import { successResponse } from '@/common/utils/response/response';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
    @Inject(REDIS_CLIENT)
    private readonly cache: Redis,
  ) { };

  public async create(createOrganizationDto: CreateOrganizationDto) {
    const { name, country_id, city_id, status } = createOrganizationDto;

    // check if organization already exists
    const organization = await this.db.query.organizations.findFirst({
      where: eq(organizations.name, name)
    });
    if (organization)
      throw new BadRequestException('Organization already exists');

    // find country and city
    const country = await this.db.query.countries.findFirst({
      where: eq(countries.id, country_id)
    });
    if (!country)
      throw new BadRequestException('Country not found');
    const city = await this.db.query.cities.findFirst({
      where: eq(cities.id, city_id)
    });
    if (!city)
      throw new BadRequestException('City not found');

    // check if city belongs to country
    if (city.country_id !== country.id)
      throw new BadRequestException('City does not belong to country');

    // check if country or city is inactive
    if (country.status === 'INACTIVE' || city.status === 'INACTIVE')
      throw new BadRequestException('Country or city is inactive');

    // create organization
    const newOrganization = await this.db.insert(organizations).values({ name, country_id, city_id, status }).returning({
      id: organizations.id,
      name: organizations.name,
      country_id: organizations.country_id,
      city_id: organizations.city_id,
      status: organizations.status,
      created_at: organizations.created_at,
      updated_at: organizations.updated_at,
    }).then(result => result[0]);

    // delete organzation list from cache
    await this.cache.del('organizations_list');

    // return success response
    return (successResponse('Organization created successfully', { ...newOrganization }));
  };

  public async fetchAll(filters: {
    page: number;
    limit: number;
    name?: string;
    country_id?: string;
  }) {
    const { page, limit, name, country_id } = filters;

    // get organizations and total count
    const [organizations_db, total] = await Promise.all([
      this.db.query.organizations.findMany({
        where: and(
          ...(name ? [ilike(organizations.name, `%${name.toLowerCase().trim()}%`)] : []),
          ...(country_id ? [eq(organizations.country_id, country_id)] : []),
        ),
        limit: limit,
        offset: (page - 1) * limit,
        orderBy: [desc(organizations.name)],
      }),
      this.db.select({ count: count() }).from(organizations).where(
        and(
          ...(name ? [ilike(organizations.name, `%${name.toLowerCase().trim()}%`)] : []),
          ...(country_id ? [eq(organizations.country_id, country_id)] : []),
        )
      ).then(result => result[0].count)
    ]);

    // prepare the result
    const result = {
      organizations: organizations_db,
      pagination: {
        total,
        current_page: page,
        total_pages: Math.ceil(total / limit),
        has_next_page: page < Math.ceil(total / limit),
        has_previous_page: page > 1,
      }
    }

    // return success response
    return (successResponse('Organizations fetched successfully', result));
  };

  public async fetchList() {

    // fetch list from cache
    const organizations_list = await this.cache.get('organizations_list');
    if (organizations_list)
      return (successResponse('Organizations fetched successfully from cache', JSON.parse(organizations_list)));


    // get organizations
    const organizations_db = await this.db.query.organizations.findMany({
      orderBy: [asc(organizations.name)],
      columns: {
        id: true,
        name: true
      }
    });

    // set list to cache
    await this.cache.set('organizations_list', JSON.stringify(organizations_db));

    // return success response
    return (successResponse('Organizations fetched successfully from db', organizations_db));
  };

  public async delete(id: string) {
    // check if organization exists
    const organization = await this.db.query.organizations.findFirst({
      where: eq(organizations.id, id)
    });
    if (!organization)
      throw new BadRequestException('Organization not found');

    // check if organization has users
    const users_db = await this.db.query.users.findMany({
      where: eq(users.organization_id, id)
    });
    if (users_db.length > 0)
      throw new BadRequestException('Organization has users!');

    // delete organization
    await this.db.delete(organizations).where(eq(organizations.id, id));

    // delete list from cache
    await this.cache.del('organizations_list');

    // return success response
    return (successResponse('Organization deleted successfully'));
  };

  public async update(id: string, data: UpdateOrganizationDto) {
    // check if organization exists
    const organization = await this.db.query.organizations.findFirst({
      where: eq(organizations.id, id)
    });
    if (!organization)
      throw new BadRequestException('Organization not found');

    // find country
    if (data.country_id) {
      const country = await this.db.query.countries.findFirst({
        where: eq(countries.id, data.country_id)
      });
      if (!country)
        throw new BadRequestException('Country not found');
      if (country.status === 'INACTIVE')
        throw new BadRequestException('Country is inactive');
    }

    // find city and check if it belongs to country
    if (data.city_id) {
      const city = await this.db.query.cities.findFirst({
        where: eq(cities.id, data.city_id)
      });
      if (!city)
        throw new BadRequestException('City not found');
      if (city.status === 'INACTIVE')
        throw new BadRequestException('City is inactive');
      if (city.country_id !== (data.country_id ?? organization.country_id))
        throw new BadRequestException('City does not belong to country');
    }

    // update organization
    const updated_organization = await this.db.update(organizations).set({
      name: data.name ?? organization.name,
      country_id: data.country_id ?? organization.country_id,
      city_id: data.city_id ?? organization.city_id,
      status: data.status ?? organization.status,
    }).where(eq(organizations.id, id)).returning().then(result => result[0]);

    // delete list from cache
    await this.cache.del('organizations_list');

    // return success response
    return (successResponse('Organization updated successfully', updated_organization));
  };

  /**
   * Find organization by ID - used to fetch organizations for any service that needs it
   * @param id - Organization ID
   * @returns organization object
   */
  public async findById(id: string) {
    const organization = await this.db.query.organizations.findFirst({
      where: eq(organizations.id, id)
    });
    if (!organization)
      throw (new NotFoundException('Organization not found'));

    return (organization);
  }
}
