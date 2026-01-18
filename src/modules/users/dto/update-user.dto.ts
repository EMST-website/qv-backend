import { IsDateString, IsEmail, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import type { UserGenderEnum } from '../schema/users.schema';

export class UpdateUserDto {
   @ApiProperty({ 
     example: 'John',
     description: 'User first name',
     required: false
   })
   @IsString()
   @IsOptional()
   first_name?: string;

   @ApiProperty({ 
     example: 'Doe',
     description: 'User last name',
     required: false
   })
   @IsString()
   @IsOptional()
   last_name?: string;

   @ApiProperty({ 
     example: 'Software Engineer',
     description: 'User job title or position',
     required: false
   })
   @IsString()
   @IsOptional()
   title?: string;

   @ApiProperty({ 
     example: 'john.doe@example.com',
     description: 'User email address',
     required: false
   })
   @IsEmail()
   @IsOptional()
   email?: string;

   @ApiProperty({ 
     example: '+1234567890',
     description: 'User phone number',
     required: false
   })
   @IsString()
   @IsOptional()
   phone?: string;

   @ApiProperty({ 
     example: '123e4567-e89b-12d3-a456-426614174000',
     description: 'Country UUID',
     format: 'uuid',
     required: false
   })
   @IsUUID()
   @IsOptional()
   country_id?: string;

   @ApiProperty({ 
     example: '223e4567-e89b-12d3-a456-426614174000',
     description: 'City UUID',
     format: 'uuid',
     required: false
   })
   @IsUUID()
   @IsOptional()
   city_id?: string;

   @ApiProperty({ 
     example: '323e4567-e89b-12d3-a456-426614174000',
     description: 'Organization UUID',
     format: 'uuid',
     required: false
   })
   @IsUUID()
   @IsOptional()
   organization_id?: string;

   @ApiProperty({ 
     example: 'MALE',
     enum: ['MALE', 'FEMALE'],
     description: 'User gender',
     required: false
   })
   @IsEnum(['MALE', 'FEMALE'], {message: 'Gender must be either MALE or FEMALE'})
   @IsOptional()
   gender?: UserGenderEnum;

   @ApiProperty({ 
     example: '1990-01-15',
     description: 'User date of birth (ISO date string)',
     required: false
   })
   @IsDateString()
   @IsOptional()
   date_of_birth?: string;
}