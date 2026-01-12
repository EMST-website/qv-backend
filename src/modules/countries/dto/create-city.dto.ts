import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import type { CityStatusEnum } from "../schema/cities.schema";
import { ApiProperty } from "@nestjs/swagger";

export class CreateCityDto {
   @ApiProperty({
      description: 'City name',
      example: 'Dubai'
   })
   @IsString()
   @IsNotEmpty()
   name: string;

   @ApiProperty({
      description: 'City status. Defaults to ACTIVE if not provided',
      enum: ['ACTIVE', 'INACTIVE'],
      example: 'ACTIVE',
      required: false
   })
   @IsEnum(['ACTIVE', 'INACTIVE'])
   @IsOptional()
   status?: CityStatusEnum;
}