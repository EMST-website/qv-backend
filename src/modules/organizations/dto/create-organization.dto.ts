import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import type { OrganizationStatusEnum } from '../organizations.schema';

export class CreateOrganizationDto {
  @ApiProperty({
    description: 'Organization name. Must be unique across all organizations.',
    example: 'Tech Solutions Inc.',
    minLength: 1,
    maxLength: 255
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'UUID of the country where the organization is located. The country must exist and be active.',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid'
  })
  @IsUUID()
  @IsNotEmpty()
  country_id: string;

  @ApiProperty({
    description: 'UUID of the city where the organization is located. The city must exist, be active, and belong to the specified country.',
    example: '223e4567-e89b-12d3-a456-426614174000',
    format: 'uuid'
  })
  @IsUUID()
  @IsNotEmpty()
  city_id: string;

  @ApiProperty({
    description: 'Organization status. Determines if the organization is active or inactive.',
    enum: ['ACTIVE', 'INACTIVE'],
    example: 'ACTIVE'
  })
  @IsEnum(['ACTIVE', 'INACTIVE'])
  @IsNotEmpty()
  status: OrganizationStatusEnum;
};
