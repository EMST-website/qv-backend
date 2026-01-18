import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import type { CategoryStatusEnum } from "../categories.schema";

export class UpdateCategoryDto {
   @ApiPropertyOptional({
      description: 'Category title. Must be between 3 and 255 characters if provided.',
      example: 'Electronics & Gadgets',
      minLength: 3,
      maxLength: 255
   })
   @IsString()
   @IsOptional()
   @MinLength(3)
   @MaxLength(255)
   title?: string;

   @ApiPropertyOptional({
      description: 'Category status. Determines if the category is active or inactive.',
      enum: ['ACTIVE', 'INACTIVE'],
      example: 'ACTIVE'
   })
   @IsEnum(['ACTIVE', 'INACTIVE'])
   @IsOptional()
   status?: CategoryStatusEnum;

   @ApiPropertyOptional({
      type: 'string',
      format: 'binary',
      description: 'Category image file. Supported formats: JPEG, PNG, GIF. Will be uploaded to Cloudinary and replace the existing image.',
      required: false
   })
   file?: any;
}
