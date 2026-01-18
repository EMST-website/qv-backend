import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import type { CategoryStatusEnum } from "../categories.schema";

export class CreateCategoryDto {
   @ApiProperty({
      description: 'Category title. Must be a non-empty string.',
      example: 'Electronics',
      minLength: 1,
      maxLength: 255
   })
   @IsString()
   @IsNotEmpty()
   title: string;

   @ApiProperty({
      description: 'Category status. Determines if the category is active or inactive.',
      enum: ['ACTIVE', 'INACTIVE'],
      example: 'ACTIVE'
   })
   @IsEnum(['ACTIVE', 'INACTIVE'])
   @IsNotEmpty()
   status: CategoryStatusEnum;

   @ApiProperty({
      type: 'string',
      format: 'binary',
      description: 'Category image file. Supported formats: JPEG, PNG, GIF. Will be uploaded to Cloudinary.',
      required: true
   })
   file: any;
};
