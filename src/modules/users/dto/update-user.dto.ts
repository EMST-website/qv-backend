import { IsDateString, IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import type { UserGenderEnum } from '../schema/users.schema';

export class UpdateUserDto {
   @IsString()
   @IsOptional()
   first_name?: string;

   @IsString()
   @IsOptional()
   last_name?: string;

   @IsEmail()
   @IsOptional()
   email?: string;

   @IsString()
   @IsOptional()
   phone?: string;

   @IsString()
   @IsOptional()
   country_id?: string;

   @IsString()
   @IsOptional()
   city_id?: string;

   @IsString()
   @IsOptional()
   organization_id?: string;

   @IsEnum(['MALE', 'FEMALE'], {message: 'Gender must be either MALE or FEMALE'})
   @IsOptional()
   gender?: UserGenderEnum;

   @IsDateString()
   @IsOptional()
   date_of_birth?: string;
}