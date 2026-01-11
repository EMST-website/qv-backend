import { IsEnum, IsNotEmpty, IsString, MaxLength, MinLength, IsEmail } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';
import { AdminRoles } from "../schema/admins.schema";



export class CreateAdminsDto {
   @ApiProperty({ 
      example: 'admin@example.com',
      description: 'Admin email address',
      minLength: 3,
      maxLength: 255
   })
   @IsEmail()
   @IsNotEmpty()
   @MaxLength(255)
   @MinLength(3)
   email: string;

   @ApiProperty({ 
      example: 'SecurePass123!',
      description: 'Admin password (minimum 8 characters)',
      minLength: 8,
      maxLength: 255
   })
   @IsString()
   @IsNotEmpty()
   @MaxLength(255)
   @MinLength(8)
   password: string;

   @ApiProperty({ 
      example: 'SecurePass123!',
      description: 'Confirm password (must match password)',
      minLength: 8,
      maxLength: 255
   })
   @IsString()
   @IsNotEmpty()
   @MaxLength(255)
   @MinLength(8)
   confirm_password: string;

   @ApiProperty({ 
      example: 'John',
      description: 'Admin first name',
      minLength: 3,
      maxLength: 255
   })
   @IsString()
   @IsNotEmpty()
   @MaxLength(255)
   @MinLength(3)
   first_name: string;

   @ApiProperty({ 
      example: 'Doe',
      description: 'Admin last name',
      minLength: 3,
      maxLength: 255
   })
   @IsString()
   @IsNotEmpty()
   @MaxLength(255)
   @MinLength(3)
   last_name: string;

   @ApiProperty({ 
      example: '+971501234567',
      description: 'Admin phone number',
      minLength: 3,
      maxLength: 255
   })
   @IsString()
   @IsNotEmpty()
   @MaxLength(255)
   @MinLength(3)
   phone: string;

   @ApiProperty({ 
      example: 'United Arab Emirates',
      description: 'Admin country',
      minLength: 3,
      maxLength: 255
   })
   @IsString()
   @IsNotEmpty()
   @MaxLength(255)
   @MinLength(3)
   country: string;

   @ApiProperty({ 
      example: 'Dubai',
      description: 'Admin city',
      minLength: 3,
      maxLength: 255
   })
   @IsString()
   @IsNotEmpty()
   @MaxLength(255)
   @MinLength(3)
   city: string;

   @ApiProperty({ 
      example: 'ADMIN',
      description: 'Admin role',
      enum: ['SUPER_ADMIN', 'ADMIN']
   })
   @IsEnum(['SUPER_ADMIN', 'ADMIN'])
   @IsNotEmpty()
   role: (typeof AdminRoles.enumValues)[number];
}