import { MinLength, IsString, Min, IsNumber, IsOptional, IsEnum } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';




export class FetchAdminsDto {
   @ApiProperty({ 
      example: 1,
      description: 'Page number for pagination',
      minimum: 1,
      required: false
   })
   @IsNumber()
   @IsOptional()
   @Min(1)
   page?: number;

   @ApiProperty({ 
      example: 10,
      description: 'Number of items per page',
      minimum: 1,
      required: false
   })
   @IsNumber()
   @IsOptional()
   @Min(1)
   limit?: number;

   @ApiProperty({ 
      example: 'John',
      description: 'Search by admin first name',
      minLength: 3,
      required: false
   })
   @IsString()
   @IsOptional()
   @MinLength(3)
   search?: string;

   @ApiProperty({ 
      example: 'ADMIN',
      description: 'Filter by admin role',
      enum: ['SUPER_ADMIN', 'ADMIN'],
      required: false
   })
   @IsEnum(['SUPER_ADMIN', 'ADMIN'])
   @IsOptional()
   role?: 'SUPER_ADMIN' | 'ADMIN';
}