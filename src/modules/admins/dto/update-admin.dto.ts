import { IsEnum, IsString, IsEmail, IsOptional, MinLength, MaxLength } from "class-validator";
import { AdminRoles } from "../schema/admins.schema";



export class UpdateAdminDto {
   @IsOptional()
   @IsEmail()
   @MinLength(3)
   @MaxLength(255)
   email?: string;

   @IsOptional()
   @IsString()
   @MinLength(3)
   @MaxLength(255)
   first_name?: string;

   @IsOptional()
   @IsString()
   @MinLength(3)
   @MaxLength(255)
   last_name?: string;

   @IsOptional()
   @IsString()
   @MinLength(3)
   @MaxLength(255)
   phone?: string;

   @IsOptional()
   @IsString()
   @MinLength(3)
   @MaxLength(255)
   country?: string;

   @IsOptional()
   @IsString()
   @MinLength(3)
   @MaxLength(255)
   city?: string;

   @IsEnum(['SUPER_ADMIN', 'ADMIN'])
   @IsOptional()
   role?: (typeof AdminRoles.enumValues)[number];
};

export class UpdateAdminMeDto {
   @IsOptional()
   @IsEmail()
   @MinLength(3)
   @MaxLength(255)
   email?: string;

   @IsOptional()
   @IsString()
   @MinLength(3)
   @MaxLength(255)
   first_name?: string;

   @IsOptional()
   @IsString()
   @MinLength(3)
   @MaxLength(255)
   last_name?: string;

   @IsOptional()
   @IsString()
   @MinLength(3)
   @MaxLength(255)
   phone?: string;

   @IsOptional()
   @IsString()
   @MinLength(3)
   @MaxLength(255)
   country?: string;

   @IsOptional()
   @IsString()
   @MinLength(3)
   @MaxLength(255)
   city?: string;
};