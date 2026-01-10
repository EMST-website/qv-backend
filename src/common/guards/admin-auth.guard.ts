import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Inject } from '@nestjs/common';
import type { Request } from 'express';
import { JwtService } from '../utils/jwt/jwt.service';
import { adminRefreshTokens, AdminRoles, AdminRolesEnum, admins } from '@/database/schema';
import { DATABASE_CONNECTION } from '@/database/database.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@/database/schema';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminAuthGuard implements CanActivate {
   constructor(
      private readonly jwtService: JwtService,
      @Inject(DATABASE_CONNECTION)
      private readonly db: NodePgDatabase<typeof schema>,
   ) { };

   // check if the refresh token is valid and return the refresh token record
   private async check_refresh_token(req: Request) {
      // extract the refresh token id and refresh token from the request cookies
      const refresh_token_id = req.cookies['refresh_token_id'];
      const refresh_token = req.cookies['refresh_token'];
      // if the refresh token id or refresh token is not found, throw an unauthorized exception
      if (!refresh_token || !refresh_token_id)
         throw (new UnauthorizedException('Access denied'));

      // check if the refresh token record exists
      const refresh_token_record = await this.db.query.adminRefreshTokens.findFirst({
         where: eq(adminRefreshTokens.id, refresh_token_id),
      });
      // if the refresh token record is not found, throw an unauthorized exception
      if (!refresh_token_record)
         throw (new UnauthorizedException('Access denied'));

      // check if the refresh token is valid
      const is_refresh_token_valid = await bcrypt.compare(refresh_token, refresh_token_record.refresh_token);
      // if the refresh token is not valid, throw an unauthorized exception
      if (!is_refresh_token_valid)
         throw (new UnauthorizedException('Access denied'));

      return (refresh_token_record);
   };

   // check if the user is authenticated
   async canActivate(
      context: ExecutionContext,
   ) {
      const req: Request = context.switchToHttp().getRequest();

      // check if the request has a valid access token
      const access_token = req.cookies['access_token']?.split(' ')[1];
      if (!access_token)
         throw new UnauthorizedException('Access denied');

      try {
         // check if the access token is valid
         const decoded = this.jwtService.verify_admin_token(access_token);
         // if the access token is not valid, check if the refresh token is valid and generate a new access token
         if (!decoded) {
            // extract the refresh token id and refresh token from the request cookies
            const refresh_token_record = await this.check_refresh_token(req);

            // check if the admin exists
            const admin = await this.db.query.admins.findFirst({
               where: eq(admins.id, refresh_token_record.admin_id),
            });

            // if the admin is not found, throw an unauthorized exception
            if (!admin)
               throw (new UnauthorizedException('Access denied'));

            // generate a new access token
            const new_access_token = this.jwtService.generate_admin_access_token({
               id: admin.id,
               role: admin.role as AdminRolesEnum,
               first_name: admin.first_name,
               last_name: admin.last_name,
            });

            // set the new access token in the request cookies
            req.cookies['access_token'] = `Bearer ${new_access_token}`;

            (req as any).payload = {
               id: admin.id,
               role: admin.role as AdminRolesEnum,
               first_name: admin.first_name,
               last_name: admin.last_name,
            };
            // return true
            return (true);
         };
         // set the payload in the request
         (req as any).payload = decoded;
         // if the access token is valid, return true
         return (true);
      } catch (error) {
         throw (new UnauthorizedException(error.message));
      }
   };
};


// super admin guard
@Injectable()
export class SuperAdminAuthGuard implements CanActivate {
   constructor(
      private readonly jwtService: JwtService,
      @Inject(DATABASE_CONNECTION)
      private readonly db: NodePgDatabase<typeof schema>,
   ) { };

   // check if the user is a super admin
   canActivate(
      context: ExecutionContext,
   ) {
      const req: Request = context.switchToHttp().getRequest();

      // check if the user is a super admin
      const payload = (req as any).payload;
      if (!payload)
         throw new UnauthorizedException('Access denied');

      // if the user is not a super admin, throw an unauthorized exception
      if (payload.role !== AdminRoles.enumValues[0])
         throw new UnauthorizedException('Access denied');

      // return true
      return (true);
   };
};
