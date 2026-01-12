import { IsEnum, IsOptional, IsString } from "class-validator";
import type { CityStatusEnum } from "../schema/cities.schema";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateCityDto {
   @ApiProperty({
      description: 'City name. All fields are optional - only provided fields will be updated',
      example: 'Dubai',
      required: false
   })
   @IsString()
   @IsOptional()
   name?: string;

   @ApiProperty({
      description: 'City status',
      enum: ['ACTIVE', 'INACTIVE'],
      example: 'ACTIVE',
      required: false
   })
   @IsOptional()
   @IsEnum(['ACTIVE', 'INACTIVE'])
   status?: CityStatusEnum;
}