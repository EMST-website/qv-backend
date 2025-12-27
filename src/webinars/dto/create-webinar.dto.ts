import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsUrl,
  IsOptional,
  IsInt,
  IsArray,
  IsBoolean,
  Min,
} from 'class-validator';

export class CreateWebinarDto {
  @ApiProperty({ example: 'Advanced Cardiology Webinar' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'In-depth discussion on cardiology trends.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '2025-05-20T10:00:00Z' })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ example: '2025-05-20T12:00:00Z', required: false })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({ example: 'Zoom' })
  @IsString()
  @IsNotEmpty()
  platform: string;

  @ApiProperty({ example: 'https://zoom.us/j/123456789' })
  @IsUrl()
  @IsOptional()
  link?: string;

  @ApiProperty({ example: 500, required: false })
  @IsInt()
  @Min(1)
  @IsOptional()
  capacity?: number;

  @ApiProperty({ example: 'https://example.com/banner.jpg', required: false })
  @IsUrl()
  @IsOptional()
  bannerUrl?: string;

  @ApiProperty({ example: ['AE', 'SA'], type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  countryAvailability?: string[];

  @ApiProperty({ example: true, required: false, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
