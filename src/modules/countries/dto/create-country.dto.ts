import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength, ValidateNested } from "class-validator";
import { MaxLength } from "class-validator";
import type { CountryStatusEnum } from "../schema/countries.schema";
import type { CityStatusEnum } from "../schema/cities.schema";
import { Type } from "class-transformer";

export class CityDto {
   @IsNotEmpty()
   @IsString()
   @MinLength(3)
   @MaxLength(255)
   name: string;

   @IsNotEmpty()
   @IsEnum(['ACTIVE', 'INACTIVE'])
   status: CityStatusEnum;
};

export class CreateCountryDto {

   @IsNotEmpty()
   @IsString()
   @MinLength(3)
   @MaxLength(255)
   name: string;

   @IsNotEmpty()
   @IsString()
   @IsEnum(['ACTIVE', 'INACTIVE'])
   status: CountryStatusEnum;

   @IsOptional()
   @IsArray()
   @ValidateNested({ each: true })
   @Type(() => CityDto)
   cities?: CityDto[];
};
