import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import type { ProductStatusEnum } from "../products.schema";

export class ProductDetailDto {
   @IsString()
   @IsNotEmpty()
   label: string;

   @IsString()
   @IsNotEmpty()
   value: string;
}

export class CreateProductDto {
   @IsString()
   @IsNotEmpty()
   name: string;

   @IsString()
   @IsOptional()
   description?: string;

   @IsEnum(['ACTIVE', 'INACTIVE'])
   @IsNotEmpty()
   status: ProductStatusEnum;

   @IsArray()
   @IsUUID('4', { each: true })
   @IsOptional()
   category_ids?: string[];

   @IsArray()
   @ValidateNested({ each: true })
   @Type(() => ProductDetailDto)
   @IsOptional()
   details?: ProductDetailDto[];
}
