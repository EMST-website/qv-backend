import { Body, Controller, Get, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import type { Response, Request } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { AdminsService } from './admins.service';
import { LoginAdminsDto, VerifyOTPDto } from './dto/login-admins.dto';
import { successResponse } from '@/common/utils/response/response';
import { CreateAdminsDto } from './dto/create-admin.dto';
import { AdminAuthGuard, SuperAdminAuthGuard } from '@/common/guards/admin-auth.guard';
import { FetchAdminsDto } from './dto/fetch-admins.dto';


@Controller('admins')
// @Version('1')
@ApiTags('admins')
export class AdminsController {
   constructor(private readonly adminsService: AdminsService) {};

   @Post('login')
   async Login(@Body() body: LoginAdminsDto) {
      return (await this.adminsService.login(body));
   };

   @Post('verify-otp')
   async VerifyOTP(@Body() body: VerifyOTPDto, @Res() res: Response) {
      const response = await this.adminsService.verifyOTP(body);

      // set the cookies for the access token and refresh token
      res.cookie('access_token', response.data?.access_token, {
         httpOnly: true,
         secure: process.env.NODE_ENV === 'production',
         maxAge: 1000 * 60 * 60, // 1 hour
         sameSite: 'strict',
      });
      res.cookie('refresh_token', response.data?.refresh_token.token, {
         httpOnly: true,
         secure: process.env.NODE_ENV === 'production',
         maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
         sameSite: 'strict',
      });
      res.cookie('refresh_token_id', response.data?.refresh_token.id, {
         httpOnly: true,
         secure: process.env.NODE_ENV === 'production',
         maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
         sameSite: 'strict',
      });
      // return the response
      return (res.json(response));
   };

   @Get('logout')
   async Logout(@Req() req: Request, @Res() res: Response) {
      const refresh_token_id = req.cookies['refresh_token_id'];
      const refresh_token = req.cookies['refresh_token'];

      // function check if the refresh token is valid and delete the refresh token record
      const logout = await this.adminsService.logout(refresh_token_id, refresh_token);
      if (!logout) {
         return (res.json(successResponse('Logout successful')));
      };

      // clear the cookies
      res.clearCookie('access_token');
      res.clearCookie('refresh_token');
      res.clearCookie('refresh_token_id');
      // return the success response
      return (res.json(logout));
   };

   @Post('create-admin')
   @UseGuards(AdminAuthGuard, SuperAdminAuthGuard)
   async CreateAdmin(@Body() body: CreateAdminsDto) {
      return (await this.adminsService.createAdmin(body));
   };

   @Get('')
   @UseGuards(AdminAuthGuard, SuperAdminAuthGuard)
   async GetAdmins(
      @Query() query: FetchAdminsDto
   ) {
      const { page, limit, search, role } = query;
      const page_value = page ? parseInt(page.toString(), 10) : 1;
      const limit_value = limit ? parseInt(limit.toString(), 10) : 10;
      const filters = {
         page: page_value,
         limit: limit_value,
         search: search,
         role: role,
      }
      return (await this.adminsService.getAdmins(filters));
   };

};
