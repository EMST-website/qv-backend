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

  @ApiProperty({ example: '+1234567890' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsEnum(['MALE', 'FEMALE'], {message: 'Gender must be either MALE or FEMALE'})
  @IsOptional()
  gender?: UserGenderEnum;

  @ApiProperty({ example: '2025-01-01' })
  @IsDateString()
  @IsOptional()
  date_of_birth?: string;

  @IsUUID()
  @IsNotEmpty()
  country_id: string;

  @IsUUID()
  @IsOptional()
  city_id?: string;

  @IsUUID()
  @IsNotEmpty()
  organization_id: string;
}
