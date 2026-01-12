import { IsEnum, IsNumber, IsOptional, IsString, Min } from "class-validator";
import type { CountryStatusEnum } from "../schema/countries.schema";
import { ApiProperty } from "@nestjs/swagger";

export class FetchCountriesDto {
   @ApiProperty({
      description: 'Page number for pagination',
      example: 1,
      minimum: 1,
      required: false,
      default: 1
   })
   @IsNumber()
   @IsOptional()
   @Min(1)
   page?: number;

   @ApiProperty({
      description: 'Number of items per page',
      example: 10,
      minimum: 1,
      required: false,
      default: 10
   })
   @IsNumber()
   @IsOptional()
   @Min(1)
   limit?: number;

   @ApiProperty({
      description: 'Search term to filter countries by name (partial match)',
      example: 'United',
      required: false
   })
   @IsString()
   @IsOptional()
   search?: string;

   @ApiProperty({
      description: 'Filter countries by status',
      enum: ['ACTIVE', 'INACTIVE'],
      example: 'ACTIVE',
      required: false
   })
   @IsEnum(['ACTIVE', 'INACTIVE'])
   @IsOptional()
   status?: CountryStatusEnum;
}