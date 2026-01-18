import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Min } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class FetchProductsDto {
   @ApiPropertyOptional({
      description: 'Page number for pagination. Default is 1.',
      example: 1,
      minimum: 1,
      type: Number
   })
   @IsOptional()
   @Type(() => Number)
   @IsInt()
   @Min(1)
   page?: number;

   @ApiPropertyOptional({
      description: 'Number of items per page. Default is 10.',
      example: 10,
      minimum: 1,
      type: Number
   })
   @IsOptional()
   @Type(() => Number)
   @IsInt()
   @Min(1)
   limit?: number;

   @ApiPropertyOptional({
      description: 'Search term to filter products by title. Case-insensitive partial match.',
      example: 'Wireless'
   })
   @IsOptional()
   @IsString()
   search?: string;

   @ApiPropertyOptional({
      description: 'Filter products by category UUID. Returns products that belong to the specified category.',
      example: '550e8400-e29b-41d4-a716-446655440000',
      format: 'uuid'
   })
   @IsOptional()
   @IsUUID('4')
   category_id?: string;

   @ApiPropertyOptional({
      description: 'Filter products by status. Can be either ACTIVE or INACTIVE.',
      enum: ['ACTIVE', 'INACTIVE'],
      example: 'ACTIVE'
   })
   @IsOptional()
   @IsEnum(['ACTIVE', 'INACTIVE'])
   status?: string;
}
