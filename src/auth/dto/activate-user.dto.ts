import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ActivateUserDto {
  @ApiProperty({
    description: 'Activation token sent via email',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsString()
  token: string;

  @ApiProperty({
    description: 'New password for the user',
    example: 'SecurePassword123!',
  })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({
    description: 'First name',
    example: 'John',
    required: false,
  })
  @IsString()
  firstName?: string;

  @ApiProperty({
    description: 'Last name',
    example: 'Doe',
    required: false,
  })
  @IsString()
  lastName?: string;

  @ApiProperty({
    description: 'Phone number',
    example: '+1234567890',
    required: false,
  })
  @IsString()
  phone?: string;

  @ApiProperty({
    description: 'Country',
    example: 'United States',
    required: false,
  })
  @IsString()
  country?: string;

  @ApiProperty({
    description: 'City',
    example: 'New York',
    required: false,
  })
  @IsString()
  city?: string;
}
