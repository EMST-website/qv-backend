import { IsEnum, IsInt, IsOptional, IsString, Min } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class FetchArticlesDto {
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
      description: 'Search term to filter articles by title. Case-insensitive partial match.',
      example: 'Quantum'
   })
   @IsOptional()
   @IsString()
   search?: string;

   @ApiPropertyOptional({
      description: 'Filter articles by status. Can be DRAFT, PUBLISHED, or UNPUBLISHED.',
      enum: ['DRAFT', 'PUBLISHED', 'UNPUBLISHED'],
      example: 'PUBLISHED'
   })
   @IsOptional()
   @IsEnum(['DRAFT', 'PUBLISHED', 'UNPUBLISHED'])
   status?: string;
}
