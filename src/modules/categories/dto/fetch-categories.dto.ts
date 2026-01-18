import { IsNumber, IsOptional, IsString } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class FetchCategoriesDto {
   @ApiPropertyOptional({
      description: 'Page number for pagination. Default is 1.',
      example: 1,
      minimum: 1,
      type: Number
   })
   @IsOptional()
   @Type(() => Number)
   @IsNumber()
   page?: number;

   @ApiPropertyOptional({
      description: 'Number of items per page. Default is 10.',
      example: 10,
      minimum: 1,
      type: Number
   })
   @IsOptional()
   @Type(() => Number)
   @IsNumber()
   limit?: number;

   @ApiPropertyOptional({
      description: 'Search term to filter categories by title. Case-insensitive partial match.',
      example: 'Electronics'
   })
   @IsOptional()
   @IsString()
   search?: string;
}
