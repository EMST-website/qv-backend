import { IsEnum, IsOptional, IsString, MinLength } from "class-validator";
import { MaxLength } from "class-validator";
import type { CountryStatusEnum } from "../schema/countries.schema";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateCountriesDto {
   @ApiProperty({
      description: 'Country name. All fields are optional - only provided fields will be updated',
      example: 'United Arab Emirates',
      minLength: 3,
      maxLength: 255,
      required: false
   })
   @IsOptional()
   @IsString()
   @MinLength(3)
   @MaxLength(255)
   name?: string;

   @ApiProperty({
      description: 'Country status',
      enum: ['ACTIVE', 'INACTIVE'],
      example: 'ACTIVE',
      required: false
   })
   @IsOptional()
   @IsString()
   @IsEnum(['ACTIVE', 'INACTIVE'])
   status?: CountryStatusEnum;
};
