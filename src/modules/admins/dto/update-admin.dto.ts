import { IsEnum, IsString, IsEmail, IsOptional, MinLength, MaxLength } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';
import { AdminRoles } from "../schema/admins.schema";



export class UpdateAdminDto {
   @ApiProperty({ 
      example: 'admin@example.com',
      description: 'Admin email address',
      required: false,
      minLength: 3,
      maxLength: 255
   })
   @IsOptional()
   @IsEmail()
   @MinLength(3)
   @MaxLength(255)
   email?: string;

   @ApiProperty({ 
      example: 'John',
      description: 'Admin first name',
      required: false,
      minLength: 3,
      maxLength: 255
   })
   @IsOptional()
   @IsString()
   @MinLength(3)
   @MaxLength(255)
   first_name?: string;

   @ApiProperty({ 
      example: 'Doe',
      description: 'Admin last name',
      required: false,
      minLength: 3,
      maxLength: 255
   })
   @IsOptional()
   @IsString()
   @MinLength(3)
   @MaxLength(255)
   last_name?: string;

   @ApiProperty({ 
      example: '+971501234567',
      description: 'Admin phone number',
      required: false,
      minLength: 3,
      maxLength: 255
   })
   @IsOptional()
   @IsString()
   @MinLength(3)
   @MaxLength(255)
   phone?: string;

   @ApiProperty({ 
      example: 'United Arab Emirates',
      description: 'Admin country',
      required: false,
      minLength: 3,
      maxLength: 255
   })
   @IsOptional()
   @IsString()
   @MinLength(3)
   @MaxLength(255)
   country?: string;

   @ApiProperty({ 
      example: 'Dubai',
      description: 'Admin city',
      required: false,
      minLength: 3,
      maxLength: 255
   })
   @IsOptional()
   @IsString()
   @MinLength(3)
   @MaxLength(255)
   city?: string;

   @ApiProperty({ 
      example: 'ADMIN',
      description: 'Admin role (only Super Admins can update roles)',
      enum: ['SUPER_ADMIN', 'ADMIN'],
      required: false
   })
   @IsEnum(['SUPER_ADMIN', 'ADMIN'])
   @IsOptional()
   role?: (typeof AdminRoles.enumValues)[number];
};

export class UpdateAdminMeDto {
   @ApiProperty({ 
      example: 'admin@example.com',
      description: 'Admin email address',
      required: false,
      minLength: 3,
      maxLength: 255
   })
   @IsOptional()
   @IsEmail()
   @MinLength(3)
   @MaxLength(255)
   email?: string;

   @ApiProperty({ 
      example: 'John',
      description: 'Admin first name',
      required: false,
      minLength: 3,
      maxLength: 255
   })
   @IsOptional()
   @IsString()
   @MinLength(3)
   @MaxLength(255)
   first_name?: string;

   @ApiProperty({ 
      example: 'Doe',
      description: 'Admin last name',
      required: false,
      minLength: 3,
      maxLength: 255
   })
   @IsOptional()
   @IsString()
   @MinLength(3)
   @MaxLength(255)
   last_name?: string;

   @ApiProperty({ 
      example: '+971501234567',
      description: 'Admin phone number',
      required: false,
      minLength: 3,
      maxLength: 255
   })
   @IsOptional()
   @IsString()
   @MinLength(3)
   @MaxLength(255)
   phone?: string;

   @ApiProperty({ 
      example: 'United Arab Emirates',
      description: 'Admin country',
      required: false,
      minLength: 3,
      maxLength: 255
   })
   @IsOptional()
   @IsString()
   @MinLength(3)
   @MaxLength(255)
   country?: string;

   @ApiProperty({ 
      example: 'Dubai',
      description: 'Admin city',
      required: false,
      minLength: 3,
      maxLength: 255
   })
   @IsOptional()
   @IsString()
   @MinLength(3)
   @MaxLength(255)
   city?: string;
};