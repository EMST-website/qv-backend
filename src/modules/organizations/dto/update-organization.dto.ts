import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import type { OrganizationStatusEnum } from '../organizations.schema';

export class UpdateOrganizationDto {
   @ApiProperty({
      description: 'Organization name. Must be unique across all organizations if provided. All fields are optional - only provided fields will be updated.',
      example: 'Updated Tech Solutions Inc.',
      minLength: 1,
      maxLength: 255,
      required: false
   })
   @IsOptional()
   @IsString()
   name?: string;

   @ApiProperty({
      description: 'UUID of the country where the organization is located. The country must exist and be active if provided. If city_id is also provided, the city must belong to this country.',
      example: '123e4567-e89b-12d3-a456-426614174000',
      format: 'uuid',
      required: false
   })
   @IsOptional()
   @IsUUID()
   country_id?: string;

   @ApiProperty({
      description: 'UUID of the city where the organization is located. The city must exist, be active, and belong to the specified country (or organization\'s current country if country_id is not provided).',
      example: '223e4567-e89b-12d3-a456-426614174000',
      format: 'uuid',
      required: false
   })
   @IsOptional()
   @IsUUID()
   city_id?: string;

   @ApiProperty({
      description: 'Organization status. Determines if the organization is active or inactive.',
      enum: ['ACTIVE', 'INACTIVE'],
      example: 'ACTIVE',
      required: false
   })
   @IsOptional()
   @IsEnum(['ACTIVE' , 'INACTIVE'])
   status?: OrganizationStatusEnum;
}
