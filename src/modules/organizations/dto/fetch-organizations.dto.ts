import { IsNumber, IsOptional, IsString, IsUUID, Min } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class FetchOrganizationsDto {
   @ApiProperty({
      description: 'Page number for pagination. Results are ordered by name in descending order.',
      example: 1,
      minimum: 1,
      required: false,
      default: 1
   })
   @IsOptional()
   @IsNumber()
   @Min(1)
   page?: number;

   @ApiProperty({
      description: 'Number of organizations to return per page.',
      example: 10,
      minimum: 1,
      required: false,
      default: 10
   })
   @IsOptional()
   @IsNumber()
   @Min(1)
   limit?: number;

   @ApiProperty({
      description: 'Filter organizations by exact name match. Case-sensitive.',
      example: 'Tech Solutions Inc.',
      required: false
   })
   @IsOptional()
   @IsString()
   name?: string;

   @ApiProperty({
      description: 'Filter organizations by country UUID. Returns only organizations located in the specified country.',
      example: '123e4567-e89b-12d3-a456-426614174000',
      format: 'uuid',
      required: false
   })
   @IsOptional()
   @IsUUID()
   country_id?: string;
}