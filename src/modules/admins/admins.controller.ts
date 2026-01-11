import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query, Req, Res, UseGuards } from '@nestjs/common';
import type { Response, Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { AdminsService } from './admins.service';
import { LoginAdminsDto, VerifyOTPDto } from './dto/login-admins.dto';
import { successResponse } from '@/common/utils/response/response';
import { CreateAdminsDto } from './dto/create-admin.dto';
import { AdminAuthGuard, SuperAdminAuthGuard } from '@/common/guards/admin-auth.guard';
import { FetchAdminsDto } from './dto/fetch-admins.dto';
import { UpdateAdminDto, UpdateAdminMeDto } from './dto/update-admin.dto';
import { AdminPayload } from '@/common/types/payload';


@Controller('admins')
@ApiTags('admins')
export class AdminsController {
   constructor(private readonly adminsService: AdminsService) {};

   @Post('login')
   @ApiOperation({ 
      summary: 'Admin login',
      description: 'Authenticate admin with email and password. Returns a session ID and sends OTP to email for 2FA verification.'
   })
   @ApiBody({ type: LoginAdminsDto })
   @ApiResponse({ 
      status: 200, 
      description: 'Login successful, OTP sent to email. Use session_id with verify-otp endpoint.',
      schema: {
         example: {
            success: true,
            message: 'OTP sent to email',
            data: { session_id: '123e4567-e89b-12d3-a456-426614174000' }
         }
      }
   })
   @ApiResponse({ status: 401, description: 'Invalid email or password' })
   @ApiResponse({ status: 400, description: 'Validation error - check email format and password length' })
   async Login(@Body() body: LoginAdminsDto) {
      return (await this.adminsService.login(body));
   };

   @Post('verify-otp')
   @ApiOperation({ 
      summary: 'Verify OTP for 2FA',
      description: 'Verify the OTP code sent to email after login. Returns access and refresh tokens in HTTP-only cookies.'
   })
   @ApiBody({ type: VerifyOTPDto })
   @ApiResponse({ 
      status: 200, 
      description: 'OTP verified successfully. Access token, refresh token, and refresh_token_id set as HTTP-only cookies.',
      schema: {
         example: {
            success: true,
            message: 'Login successful',
            data: {
               access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
               refresh_token: {
                  id: '123e4567-e89b-12d3-a456-426614174000',
                  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
               }
            }
         }
      }
   })
   @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
   @ApiResponse({ status: 404, description: 'Session not found' })
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
   @ApiOperation({ 
      summary: 'Logout admin',
      description: 'Logout admin and invalidate refresh token. Clears all authentication cookies.'
   })
   @ApiResponse({ 
      status: 200, 
      description: 'Logout successful',
      schema: {
         example: {
            success: true,
            message: 'Logout successful'
         }
      }
   })
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
   @ApiBearerAuth()
   @ApiOperation({ 
      summary: 'Create a new admin (Super Admin only)',
      description: 'Create a new admin account. Only accessible by Super Admins. Requires authentication via access_token cookie.'
   })
   @ApiBody({ type: CreateAdminsDto })
   @ApiResponse({ 
      status: 201, 
      description: 'Admin created successfully',
      schema: {
         example: {
            success: true,
            message: 'Admin created successfully',
            data: {
               id: '123e4567-e89b-12d3-a456-426614174000',
               email: 'admin@example.com',
               first_name: 'John',
               last_name: 'Doe',
               role: 'ADMIN'
            }
         }
      }
   })
   @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing access token' })
   @ApiResponse({ status: 403, description: 'Forbidden - Only Super Admins can create admins' })
   @ApiResponse({ status: 400, description: 'Bad Request - Admin already exists or validation error' })
   async CreateAdmin(@Body() body: CreateAdminsDto) {
      return (await this.adminsService.createAdmin(body));
   };

   @Get('')
   @UseGuards(AdminAuthGuard, SuperAdminAuthGuard)
   @ApiBearerAuth()
   @ApiOperation({ 
      summary: 'Get all admins with filters (Super Admin only)',
      description: 'Retrieve paginated list of admins with optional search and role filters. Only accessible by Super Admins.'
   })
   @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)', example: 1 })
   @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)', example: 10 })
   @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by admin first name', example: 'John' })
   @ApiQuery({ name: 'role', required: false, enum: ['SUPER_ADMIN', 'ADMIN'], description: 'Filter by role', example: 'ADMIN' })
   @ApiResponse({ 
      status: 200, 
      description: 'Admins retrieved successfully',
      schema: {
         example: {
            success: true,
            data: [
               {
                  id: '123e4567-e89b-12d3-a456-426614174000',
                  email: 'admin@example.com',
                  first_name: 'John',
                  last_name: 'Doe',
                  phone: '+971501234567',
                  country: 'UAE',
                  city: 'Dubai',
                  role: 'ADMIN',
                  created_at: '2024-01-01T00:00:00.000Z'
               }
            ],
            total: 1,
            page: 1,
            limit: 10
         }
      }
   })
   @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing access token' })
   @ApiResponse({ status: 403, description: 'Forbidden - Only Super Admins can view all admins' })
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

   @Put('me')
   @UseGuards(AdminAuthGuard)
   async UpdateMe(@Body() body: UpdateAdminMeDto, @Req() req: Request & { payload: AdminPayload }) {
      const payload = req.payload;
      console.log(payload);
      return (await this.adminsService.updateMe(payload.id, body));
   };

   @Put(':id')
   @UseGuards(AdminAuthGuard, SuperAdminAuthGuard)
   async UpdateAdmin(@Param('id', ParseUUIDPipe) id: string, @Body() body: UpdateAdminDto, @Req() req: Request & { payload: AdminPayload }) {
      const payload = req.payload;
      return (await this.adminsService.updateAdmin(id, body, payload));
   };

   @Delete(':id')
   @UseGuards(AdminAuthGuard, SuperAdminAuthGuard)
   async DeleteAdmin(@Param('id', ParseUUIDPipe) id: string) {
      return (await this.adminsService.deleteAdmin(id));
   };
};
