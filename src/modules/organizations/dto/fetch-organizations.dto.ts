import { IsNumber, IsOptional, IsString, IsUUID } from "class-validator";



export class FetchOrganizationsDto {

   @IsOptional()
   @IsNumber()
   page?: number;

   @IsOptional()
   @IsNumber()
   limit?: number;

   @IsOptional()
   @IsString()
   name?: string;

   @IsOptional()
   @IsUUID()
   country_id?: string;
}