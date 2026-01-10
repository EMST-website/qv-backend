import { BadRequestException, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { LoginAdminsDto, VerifyOTPDto } from './dto/login-admins.dto';
import { DATABASE_CONNECTION } from '@/database/database.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@/database/schema';
import { and, count, desc, eq, like, or } from 'drizzle-orm';
import { AdminRolesEnum, admins } from './schema/admins.schema';
import { adminSessions } from './schema/sessions.schema';
import * as bcrypt from 'bcrypt';
import { EmailService } from '@/common/utils/email/email.service';
import { successResponse } from '@/common/utils/response/response';
import { JwtService } from '@/common/utils/jwt/jwt.service';
import { AdminPayload } from '@/common/types/payload';
import { adminRefreshTokens } from '@/database/schema';
import { CreateAdminsDto } from './dto/create-admin.dto';


@Injectable()
export class AdminsService {
   private readonly OTP_EXPIRE_TIME: number;
   private readonly OTP_MAX_ATTEMPTS: number;
   private readonly MAX_ADMIN_REFRESH_TOKENS: number;
   constructor(
      @Inject(DATABASE_CONNECTION)
      private readonly db: NodePgDatabase<typeof schema>,
      private readonly mail: EmailService,
      private readonly jwt: JwtService
   ) {
      this.OTP_EXPIRE_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds
      this.OTP_MAX_ATTEMPTS = 5;
      this.MAX_ADMIN_REFRESH_TOKENS = 5;
   };

   async login(body: LoginAdminsDto) {
      // check if admin exists
      const admin = await this.db.query.admins.findFirst({
         where: eq(admins.email, body.email),
         columns: {
            id: true,
            email: true,
            password: true
         }
      });

      // if admin does not exist, throw error
      if (!admin)
         throw (new UnauthorizedException('Invalid credentials'));

      // if password is not valid, throw error
      const is_password_valid = await bcrypt.compare(body.password, admin.password);
      if (!is_password_valid)
         throw (new UnauthorizedException('Invalid credentials'));

      // check if session already exists for the admin and not expired or verified
      const old_session = await this.db.query.adminSessions.findFirst({
         where: eq(adminSessions.admin_id, admin.id),
      });
      // check if session exists and not expired
      if (old_session && old_session.expires_at > new Date())
         throw (new UnauthorizedException('Session already exists and not expired'));

      // if admin exists and password is valid, create an session otp for 2FA
      // generate a 6 numberic otp, and hash it, expires in 5 minutes
      const otp = Math.floor(100000 + Math.random() * 900000);
      const hashed_otp = await bcrypt.hash(otp.toString(), 10);
      console.log('hashed_otp', hashed_otp);
      const expires_at = new Date(Date.now() + this.OTP_EXPIRE_TIME);
      const result = await this.db.transaction(async (tx) => {
         // if session exists and not expired, remove the old session
         if (old_session && old_session.expires_at < new Date())
            await tx.delete(adminSessions).where(eq(adminSessions.id, old_session.id));

         // create a session for the admin
         const session = await tx.insert(adminSessions).values({
            admin_id: admin.id,
            otp: hashed_otp,
            expires_at
         }).returning({
            id: adminSessions.id
         }).then(rows => rows[0]);

         // send otp to admin email
         await this.mail.sendOTP(admin.email, otp.toString());
         return (session);
      });

      return (successResponse('OTP sent to email', { session_id: result.id, email: admin.email }));
   };

   async verifyOTP(body: VerifyOTPDto) {
      const session = await this.db.query.adminSessions.findFirst({
         where: eq(adminSessions.id, body.session_id)
      });

      // if session not found, throw error
      if (!session)
         throw (new NotFoundException('Session not found'));

      // if the session is expired, delete the session, and throw error
      if (session.expires_at < new Date()) {
         await this.db.delete(adminSessions).where(
            eq(adminSessions.id, body.session_id)
         );
         throw (new UnauthorizedException('Session expired'));
      };

      // if the max attempts is reached, delete the session, and throw error
      if (session.attempts >= this.OTP_MAX_ATTEMPTS) {
         await this.db.delete(adminSessions).where(
            eq(adminSessions.id, body.session_id)
         );
         throw (new UnauthorizedException('Max attempts reached'));
      };

      // if the otp is not correct, increment the attempts, and throw error
      const is_otp_valid = await bcrypt.compare(body.otp, session.otp);
      if (!is_otp_valid) {
         await this.db.update(adminSessions).set({
            attempts: session.attempts + 1
         }).where(eq(adminSessions.id, body.session_id));
         throw (new UnauthorizedException('Invalid OTP'));
      };

      // if the otp is correct, delete the session, and generate the access token and refresh token
      const result = await this.db.transaction(async (tx) => {
         await tx.delete(adminSessions).where(
            eq(adminSessions.id, body.session_id)
         );
         const admin = await tx.query.admins.findFirst({
            where: eq(admins.id, session.admin_id)
         });
         if (!admin)
            throw (new NotFoundException('Admin not found'));
         const payload: Partial<AdminPayload> = {
            id: session.admin_id,
            role: admin?.role as AdminRolesEnum,
            first_name: admin?.first_name,
            last_name: admin?.last_name,
         };

         // check if the admin has reached the maximum number of refresh tokens
         const refresh_token_count = await tx.select({ count: count() })
            .from(adminRefreshTokens)
            .where(eq(adminRefreshTokens.admin_id, admin.id))
            .then(rows => rows[0].count);

         // if the admin has reached the maximum number of refresh tokens, delete the oldest refresh token
         if (refresh_token_count >= this.MAX_ADMIN_REFRESH_TOKENS) {
            await tx.delete(adminRefreshTokens).where(eq(adminRefreshTokens.admin_id, admin.id));
         };

         // create a new refresh token for the admin
         const { access_token, refresh_token } = this.jwt.assign_admin_tokens(payload);
         const hashed_refresh_token = await bcrypt.hash(refresh_token, 10);
         const refresh_token_record = await tx.insert(adminRefreshTokens).values({
            admin_id: admin.id,
            refresh_token: hashed_refresh_token,
            expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7) // 7 days
         }).returning({
            id: adminRefreshTokens.id,
            expires_at: adminRefreshTokens.expires_at
         }).then(result => result[0]);
         return ({
            admin,
            access_token: `Bearer ${access_token}`,
            refresh_token: {
               id: refresh_token_record.id,
               token: refresh_token,
               expires_at: refresh_token_record.expires_at
            }
         })
      })

      // return the success response
      return (successResponse('OTP verified', {
         id: result.admin.id,
         first_name: result.admin.first_name,
         last_name: result.admin.last_name,
         role: result.admin.role as AdminRolesEnum,
         email: result.admin.email,
         city: result.admin.city,
         country: result.admin.country,
         phone: result.admin.phone,
         created_at: result.admin.created_at,
         updated_at: result.admin.updated_at,
         access_token: result.access_token,
         refresh_token: {
            id: result.refresh_token.id,
            token: result.refresh_token.token,
            expires_at: result.refresh_token.expires_at
         }
      }));
   };

   async logout(refresh_token_id: string, refresh_token: string) {
      // check if the refresh token record exists
      const refresh_token_record = await this.db.query.adminRefreshTokens.findFirst({
         where: eq(adminRefreshTokens.id, refresh_token_id),
      });
      if (!refresh_token_record)
         return (false);

      // check if the refresh token is valid
      const is_refresh_token_valid = await bcrypt.compare(refresh_token, refresh_token_record.refresh_token);
      if (!is_refresh_token_valid)
         return (false);

      // delete the refresh token record
      await this.db.delete(adminRefreshTokens).where(eq(adminRefreshTokens.id, refresh_token_id));

      // return the success response
      return (successResponse('Logout successful'));
   };

   public async createAdmin (body: CreateAdminsDto) {
      // check if admin already exists
      const admin = await this.db.query.admins.findFirst({
         where: or(
            eq(admins.email, body.email),
            eq(admins.phone, body.phone),
         )
      });

      // if admin already exists, throw error
      if (admin)
         throw (new BadRequestException('Admin already exists'));

      // check if password and confirm password match
      if (body.password !== body.confirm_password)
         throw (new BadRequestException('Password and confirm password do not match'));

      // hash the password
      const hashed_password = await bcrypt.hash(body.password, 10);

      // create the admin
      const new_admin = await this.db.insert(admins).values({
         email: body.email,
         password: hashed_password,
         first_name: body.first_name,
         last_name: body.last_name,
         phone: body.phone,
         country: body.country,
         city: body.city,
         role: body.role,
      }).returning({
         id: admins.id,
         email: admins.email,
         first_name: admins.first_name,
         last_name: admins.last_name,
         phone: admins.phone,
         country: admins.country,
         city: admins.city,
         role: admins.role,
         created_at: admins.created_at,
      }).then(result => result[0]);

      // return the success response
      return (successResponse('Admin created successfully', {
         ...new_admin,
      }));
   };

   async getAdmins(filters: {
      page: number;
      limit: number;
      search?: string;
      role?: 'SUPER_ADMIN' | 'ADMIN';
   }) {
      const { page, limit, search, role } = filters;
      const offset = (page - 1) * limit;
      const where_clause = [];
      if (search)
         where_clause.push(like(admins.first_name, `%${search}%`));

      if (role)
         where_clause.push(eq(admins.role, role));

      // Fetch the admins list and the total number of admins
      const [admins_list, total] = await Promise.all([
         this.db.query.admins.findMany({
            where: and(...where_clause),
            offset,
            limit,
            columns: {
               id: true,
               email: true,
               first_name: true,
               last_name: true,
               phone: true,
               country: true,
               city: true,
               role: true,
               created_at: true,
               updated_at: true,
            },
            orderBy: [desc(admins.created_at)],
         }),
         this.db.select(
            { count: count() }
         ).from(admins).where(and(...where_clause)).then(result => result[0].count)
      ]);

      // Prepare the result
      const result = {
         admins: admins_list,
         pagination: {
            total,
            current_page: page,
            total_pages: Math.ceil(total / limit),
            has_next_page: page < Math.ceil(total / limit),
            has_previous_page: page > 1,
         }
      }

      // Return the success response
      return (successResponse('Admins fetched successfully', result));
   }
};
