import { IsEnum, IsOptional, IsString, MinLength } from "class-validator";
import { MaxLength } from "class-validator";
import type { CountryStatusEnum } from "../schema/countries.schema";

export class UpdateCountriesDto {

   @IsOptional()
   @IsString()
   @MinLength(3)
   @MaxLength(255)
   name?: string;

   @IsOptional()
   @IsString()
   @IsEnum(['ACTIVE', 'INACTIVE'])
   status?: CountryStatusEnum;
};
