import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength, ValidateNested } from "class-validator";
import { MaxLength } from "class-validator";
import type { CountryStatusEnum } from "../schema/countries.schema";
import type { CityStatusEnum } from "../schema/cities.schema";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class CityDto {
   @ApiProperty({
      description: 'City name',
      example: 'Dubai',
      minLength: 3,
      maxLength: 255
   })
   @IsNotEmpty()
   @IsString()
   @MinLength(3)
   @MaxLength(255)
   name: string;

   @ApiProperty({
      description: 'City status',
      enum: ['ACTIVE', 'INACTIVE'],
      example: 'ACTIVE'
   })
   @IsNotEmpty()
   @IsEnum(['ACTIVE', 'INACTIVE'])
   status: CityStatusEnum;
};

export class CreateCountryDto {
   @ApiProperty({
      description: 'Country name',
      example: 'United Arab Emirates',
      minLength: 3,
      maxLength: 255
   })
   @IsNotEmpty()
   @IsString()
   @MinLength(3)
   @MaxLength(255)
   name: string;

   @ApiProperty({
      description: 'Country status',
      enum: ['ACTIVE', 'INACTIVE'],
      example: 'ACTIVE'
   })
   @IsNotEmpty()
   @IsString()
   @IsEnum(['ACTIVE', 'INACTIVE'])
   status: CountryStatusEnum;

   @ApiProperty({
      description: 'Optional array of cities to create along with the country',
      type: [CityDto],
      required: false,
      example: [
         { name: 'Dubai', status: 'ACTIVE' },
         { name: 'Abu Dhabi', status: 'ACTIVE' }
      ]
   })
   @IsOptional()
   @IsArray()
   @ValidateNested({ each: true })
   @Type(() => CityDto)
   cities?: CityDto[];
};
