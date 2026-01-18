import { IsInt, IsOptional, IsString, IsUUID, Min, IsArray } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type, Transform } from "class-transformer";

export class FetchStoriesDto {
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
      description: 'Search term to filter stories by author name (first name or last name). Case-insensitive partial match.',
      example: 'John'
   })
   @IsOptional()
   @IsString()
   search?: string;

   @ApiPropertyOptional({
      description: 'Filter stories by organization UUIDs. Accepts comma-separated string or array.',
      example: ['550e8400-e29b-41d4-a716-446655440000'],
      type: [String]
   })
   @IsOptional()
   @Transform(({ value }) => {
      if (typeof value === 'string') {
         return value.split(',').map(id => id.trim());
      }
      return value;
   })
   @IsArray()
   @IsUUID('4', { each: true })
   organization_ids?: string[];

   @ApiPropertyOptional({
      description: 'Filter stories by user UUIDs. Accepts comma-separated string or array.',
      example: ['660e8400-e29b-41d4-a716-446655440000'],
      type: [String]
   })
   @IsOptional()
   @Transform(({ value }) => {
      if (typeof value === 'string') {
         return value.split(',').map(id => id.trim());
      }
      return value;
   })
   @IsArray()
   @IsUUID('4', { each: true })
   user_ids?: string[];
}
