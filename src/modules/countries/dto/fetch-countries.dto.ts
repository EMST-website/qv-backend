import { IsEnum, IsNumber, IsOptional, IsString, Min } from "class-validator";
import type { CountryStatusEnum } from "../schema/countries.schema";




export class FetchCountriesDto {

   @IsNumber()
   @IsOptional()
   @Min(1)
   page?: number;

   @IsNumber()
   @IsOptional()
   @Min(1)
   limit?: number;

   @IsString()
   @IsOptional()
   search?: string;

   @IsEnum(['ACTIVE', 'INACTIVE'])
   @IsOptional()
   status?: CountryStatusEnum;
}