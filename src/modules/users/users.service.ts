import { Injectable, Inject, ConflictException, NotFoundException } from '@nestjs/common';
import { DATABASE_CONNECTION } from '@/database/database.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { successResponse } from '@/common/utils/response/response';
import { CreateUserDto } from './dto/create-user.dto';
import { or, eq, and, asc, count, ilike } from 'drizzle-orm';
import { users } from './schema/users.schema';
import * as schema from '@/database/schema';
import { CountriesService } from '../countries/countries.service';
import { OrganizationsService } from '../organizations/organizations.service';
import * as crypto from 'crypto';
import { EmailService } from '@/common/utils/email/email.service';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
    private readonly organizations_service: OrganizationsService,
    private readonly countries_service: CountriesService,
    private readonly email_service: EmailService,
  ) {};

  public async findAll(filters: {
    page: number;
    limit: number;
    search?: string;
    country_id?: string;
    city_id?: string;
    organization_id?: string;
  }) {
    const { page, limit, search, country_id, city_id, organization_id } = filters;

    const [users_list, total] = await Promise.all([
      this.db.query.users.findMany({
        where: and(
          ...(search ? [ilike(users.first_name, `%${search.toLowerCase().trim()}%`), ilike(users.last_name, `%${search.toLowerCase().trim()}%`)] : []),
          ...(organization_id ? [eq(users.organization_id, organization_id)] : []),
          ...(country_id ? [eq(users.country_id, country_id)] : []),
          ...(city_id ? [eq(users.city_id, city_id)] : []),
        ),
        offset: (page - 1) * limit,
        limit,
        orderBy: [asc(users.first_name), asc(users.last_name)],
        with: {
          country: {
            columns: {
              id: true,
              name: true,
            }
          },
          city: {
            columns: {
              id: true,
              name: true,
            }
          },
          organization: {
            columns: {
              id: true,
              name: true,
            }
          },
        },
        columns: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
          phone: true,
          gender: true,
          date_of_birth: true,
          reward_points: true,
          created_at: true,
          updated_at: true,
          status: true
        }
      }),
      this.db.select({ count: count() }).from(users).where(and(
        ...(search ? [ilike(users.first_name, `%${search.toLowerCase().trim()}%`), ilike(users.last_name, `%${search.toLowerCase().trim()}%`)] : []),
        ...(organization_id ? [eq(users.organization_id, organization_id)] : []),
        ...(country_id ? [eq(users.country_id, country_id)] : []),
        ...(city_id ? [eq(users.city_id, city_id)] : []),
      )).then(result => result[0].count)
    ]);

    // prepare the result
    const result = {
      users: users_list,
      pagination: {
        total,
        current_page: page,
        total_pages: Math.ceil(total / limit),
        has_next_page: page < Math.ceil(total / limit),
        has_previous_page: page > 1,
      }
    };

    // return the result
    return (successResponse('Users fetched successfully', result));
  }

  public async findById(id: string) {
    // find user by id and the function will throw an error if not found
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, id),
      with: {
        country: {
          columns: {
            id: true,
            name: true,
          }
        },
        city: {
          columns: {
            id: true,
            name: true,
          }
        },
        organization: {
          columns: {
            id: true,
            name: true,
          }
        },
      },
      columns: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        phone: true,
        gender: true,
        date_of_birth: true,
        reward_points: true,
        created_at: true,
        updated_at: true,
        status: true
      }
    });
    if (!user)
      throw (new NotFoundException('User not found'));

    // return the user
    return (successResponse('User fetched successfully', { ...user }));
  }

  public async create(form: CreateUserDto) {
    // check if user already exists with the same email or phone
    const user = await this.db.query.users.findFirst({
      where: or(
        eq(users.email, form.email),
        eq(users.phone, form.phone),
      )
    });
    if (user)
      throw (new ConflictException('User already exists with the same email or phone'));

    // find organization by id and the function will throw an error if not found
    const organization = await this.organizations_service.findById(form.organization_id);
    // find country and city by id and the function will throw an error if not found
    const { country, city } = await this.countries_service.findById(form.country_id, form.city_id);

    // generate activation token with crypto 64 characters
    const activation_token = crypto.randomBytes(64).toString('hex');
    // encrypt the activation token
    const encrypted_token = await bcrypt.hash(activation_token, 10);

    // generate random password with crypto 10 characters
    const random_temporary_password = crypto.randomBytes(10).toString('hex');
    // encrypt the random password
    const encrypted_password = await bcrypt.hash(random_temporary_password, 10);

    // create user with the data
    const new_user = await this.db.insert(users).values({
      email: form.email,
      password: encrypted_password,
      first_name: form.first_name,
      last_name: form.last_name,
      phone: form.phone,
      country_id: country.id,
      city_id: city ? city.id : null,
      organization_id: organization.id,
      date_of_birth: form.date_of_birth ? new Date(form.date_of_birth) : null,
      gender: form.gender ? form.gender : null,
      activation_token: encrypted_token,
    }).returning().then(res => res[0]);

    // send email to the user with the activation link in the format of {user_id}.{activation_token}
    const activation_link_format = `${new_user.id}.${activation_token}`
    // send email to the user with the activation link
    await this.email_service.sendUserCreatedEmail(new_user.email, activation_link_format);

    // return the new user
    return (successResponse('User created successfully and activation email sent', { ...new_user }));
  }

  public async update(id: string, form: UpdateUserDto) {
    // find user by id and the function will throw an error if not found
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, id)
    });
    if (!user)
      throw (new NotFoundException('User not found'));

    // check if country_id is provided and if it is, find the country by id and the function will throw an error if not found
    if (form.country_id) {
      const { country, city } = await this.countries_service.findById(form.country_id, form.city_id);
      form.country_id = country.id;
      form.city_id = city ? city.id : undefined;
    };

    // check if organization_id is provided and if it is, find the organization by id and the function will throw an error if not found
    if (form.organization_id) {
      const organization = await this.organizations_service.findById(form.organization_id);
      form.organization_id = organization.id;
    };

    // update user with the data
    const updated_user = await this.db.update(users).set({
      first_name: form.first_name ? form.first_name : undefined,
      last_name: form.last_name ? form.last_name : undefined,
      email: form.email ? form.email : undefined,
      phone: form.phone ? form.phone : undefined,
      country_id: form.country_id ? form.country_id : undefined,
      city_id: form.city_id ? form.city_id : undefined,
      organization_id: form.organization_id ? form.organization_id : undefined,
      gender: form.gender ? form.gender : user.gender,
      date_of_birth: form.date_of_birth ? new Date(form.date_of_birth) : undefined,
    }).where(eq(users.id, id)).returning().then(res => res[0]);

    // return the updated user
    return (successResponse('User updated successfully', { ...updated_user }));
  }

  public async delete(id: string) {
    // find user by id and the function will throw an error if not found
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, id)
    });
    if (!user)
      throw (new NotFoundException('User not found'));

    // delete user
    await this.db.delete(users).where(eq(users.id, id));

    // return the deleted user
    return (successResponse('User deleted successfully', { ...user }));
  }
}
