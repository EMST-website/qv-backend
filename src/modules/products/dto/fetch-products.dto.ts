import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Min } from "class-validator";
import { Type } from "class-transformer";

export class FetchProductsDto {
   @IsOptional()
   @Type(() => Number)
   @IsInt()
   @Min(1)
   page?: number;

   @IsOptional()
   @Type(() => Number)
   @IsInt()
   @Min(1)
   limit?: number;

   @IsOptional()
   @IsString()
   search?: string;

   @IsOptional()
   @IsUUID('4')
   category_id?: string;

   @IsOptional()
   @IsEnum(['ACTIVE', 'INACTIVE'])
   status?: string;
}
