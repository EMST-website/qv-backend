import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import type { CategoryStatusEnum } from "../categories.schema";



export class UpdateCategoryDto {

   @IsString()
   @IsOptional()
   @MinLength(3)
   @MaxLength(255)
   title?: string;

   @IsEnum(['ACTIVE', 'INACTIVE'])
   @IsOptional()
   status?: CategoryStatusEnum;
}