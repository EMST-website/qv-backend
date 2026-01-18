import { ArrayMinSize, IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, Length, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import type { ProductStatusEnum } from "../products.schema";

export class ProductDetailDto {
   @ApiProperty({
      description: 'Label or name of the product detail/attribute (e.g., "Color", "Size", "Material")',
      example: 'Color',
      minLength: 3,
      maxLength: 255
   })
   @IsString()
   @IsNotEmpty()
   @Length(3, 255)
   label: string;

   @ApiProperty({
      description: 'Value of the product detail/attribute corresponding to the label',
      example: 'Blue',
      minLength: 3,
      maxLength: 1000
   })
   @IsString()
   @IsNotEmpty()
   @Length(3, 1000)
   value: string;
}

export class CreateProductDto {
   @ApiProperty({
      description: 'Product name or title. Must be between 3 and 255 characters.',
      example: 'Wireless Bluetooth Headphones',
      minLength: 3,
      maxLength: 255
   })
   @IsString()
   @IsNotEmpty()
   @Length(3, 255)
   title: string;

   @ApiPropertyOptional({
      description: 'Detailed description of the product. Optional field that can contain up to 1000 characters.',
      example: 'High-quality wireless headphones with noise cancellation and 20-hour battery life',
      minLength: 3,
      maxLength: 1000
   })
   @IsString()
   @IsOptional()
   @Length(3, 1000)
   description?: string;

   @ApiProperty({
      description: 'Product status indicating availability. Can be either ACTIVE or INACTIVE.',
      enum: ['ACTIVE', 'INACTIVE'],
      example: 'ACTIVE'
   })
   @IsEnum(['ACTIVE', 'INACTIVE'])
   @IsNotEmpty()
   status: ProductStatusEnum;

   @ApiProperty({
      description: 'Array of category UUIDs that the product belongs to. At least one category is required.',
      example: ['550e8400-e29b-41d4-a716-446655440000'],
      type: [String],
      isArray: true,
      minItems: 1
   })
   @IsArray()
   @ArrayMinSize(1, { message: 'At least one category is required' })
   @IsUUID('4', { each: true })
   @IsNotEmpty()
   category_ids: string[];

   @ApiPropertyOptional({
      description: 'Optional array of product details/attributes (e.g., specifications, features). Each detail has a label and value.',
      type: [ProductDetailDto],
      example: [
         { label: 'Color', value: 'Blue' },
         { label: 'Weight', value: '250g' }
      ]
   })
   @IsArray()
   @ValidateNested({ each: true })
   @Type(() => ProductDetailDto)
   @IsOptional()
   details?: ProductDetailDto[];

   @ApiProperty({
      description: 'Product image file. Required field. Accepts image files (JPEG, PNG, WebP).',
      type: 'string',
      format: 'binary'
   })
   file: Express.Multer.File;
}
