import { IsEnum, IsNotEmpty, IsString, MaxLength, MinLength, IsEmail } from "class-validator";
import { AdminRoles } from "../schema/admins.schema";



export class CreateAdminsDto {
   @IsEmail()
   @IsNotEmpty()
   @MaxLength(255)
   @MinLength(3)
   email: string;

   @IsString()
   @IsNotEmpty()
   @MaxLength(255)
   @MinLength(8)
   password: string;

   @IsString()
   @IsNotEmpty()
   @MaxLength(255)
   @MinLength(8)
   confirm_password: string;

   @IsString()
   @IsNotEmpty()
   @MaxLength(255)
   @MinLength(3)
   first_name: string;

   @IsString()
   @IsNotEmpty()
   @MaxLength(255)
   @MinLength(3)
   last_name: string;

   @IsString()
   @IsNotEmpty()
   @MaxLength(255)
   @MinLength(3)
   phone: string;

   @IsString()
   @IsNotEmpty()
   @MaxLength(255)
   @MinLength(3)
   country: string;

   @IsString()
   @IsNotEmpty()
   @MaxLength(255)
   @MinLength(3)
   city: string;

   @IsEnum(['SUPER_ADMIN', 'ADMIN'])
   @IsNotEmpty()
   role: (typeof AdminRoles.enumValues)[number];
}