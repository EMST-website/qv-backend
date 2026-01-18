import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsUUID,
} from 'class-validator';
import type { UserGenderEnum } from '../schema/users.schema';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  last_name: string;

  @ApiProperty({ 
    example: 'Software Engineer',
    description: 'User job title or position',
    required: false
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ example: '+1234567890' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ 
    example: 'MALE', 
    enum: ['MALE', 'FEMALE'],
    description: 'User gender',
    required: false
  })
  @IsEnum(['MALE', 'FEMALE'], {message: 'Gender must be either MALE or FEMALE'})
  @IsOptional()
  gender?: UserGenderEnum;

  @ApiProperty({ example: '2025-01-01' })
  @IsDateString()
  @IsOptional()
  date_of_birth?: string;

  @ApiProperty({ 
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Country UUID',
    format: 'uuid'
  })
  @IsUUID()
  @IsNotEmpty()
  country_id: string;

  @ApiProperty({ 
    example: '223e4567-e89b-12d3-a456-426614174000',
    description: 'City UUID (optional)',
    format: 'uuid',
    required: false
  })
  @IsUUID()
  @IsOptional()
  city_id?: string;

  @ApiProperty({ 
    example: '323e4567-e89b-12d3-a456-426614174000',
    description: 'Organization UUID',
    format: 'uuid'
  })
  @IsUUID()
  @IsNotEmpty()
  organization_id: string;
}
