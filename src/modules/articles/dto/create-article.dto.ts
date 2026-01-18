import { IsEnum, IsNotEmpty, IsString, Length } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import type { ArticleStatusEnum } from "../articles.schema";

export class CreateArticleDto {
   @ApiProperty({
      description: 'Article title. Must be between 3 and 255 characters.',
      example: 'Introduction to Quantum Computing',
      minLength: 3,
      maxLength: 255
   })
   @IsString()
   @IsNotEmpty()
   @Length(3, 255)
   title: string;

   @ApiProperty({
      description: 'Detailed description or content of the article. Required field.',
      example: 'This article explores the fundamentals of quantum computing and its potential applications in modern technology.',
      minLength: 10
   })
   @IsString()
   @IsNotEmpty()
   @Length(10, 10000)
   description: string;

   @ApiProperty({
      description: 'Publication status of the article. Can be DRAFT, PUBLISHED, or UNPUBLISHED.',
      enum: ['DRAFT', 'PUBLISHED', 'UNPUBLISHED'],
      example: 'DRAFT'
   })
   @IsEnum(['DRAFT', 'PUBLISHED', 'UNPUBLISHED'])
   @IsNotEmpty()
   status: ArticleStatusEnum;
}
