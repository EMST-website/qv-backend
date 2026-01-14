import { IsNumber, IsOptional, Min, IsString, Max, IsUUID } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class FetchUsersDto {
   @ApiProperty({ 
     example: 1,
     description: 'Page number (default: 1)',
     required: false,
     minimum: 1
   })
   @IsOptional()
   @IsNumber()
   @Min(1)
   page?: number;

   @ApiProperty({ 
     example: 10,
     description: 'Items per page (default: 10, max: 100)',
     required: false,
     minimum: 1,
     maximum: 100
   })
   @IsOptional()
   @IsNumber()
   @Min(1)
   @Max(100)   
   limit?: number;

   @ApiProperty({ 
     example: 'John',
     description: 'Search term to filter users by first_name or last_name (partial match)',
     required: false
   })
   @IsOptional()
   @IsString()
   search?: string;

   @ApiProperty({ 
     example: '123e4567-e89b-12d3-a456-426614174000',
     description: 'Filter users by country UUID',
     format: 'uuid',
     required: false
   })
   @IsOptional()
   @IsUUID()
   country_id?: string;

   @ApiProperty({ 
     example: '223e4567-e89b-12d3-a456-426614174000',
     description: 'Filter users by city UUID',
     format: 'uuid',
     required: false
   })
   @IsOptional()
   @IsUUID()
   city_id?: string;

   @ApiProperty({ 
     example: '323e4567-e89b-12d3-a456-426614174000',
     description: 'Filter users by organization UUID',
     format: 'uuid',
     required: false
   })
   @IsOptional()
   @IsUUID()
   organization_id?: string;
}