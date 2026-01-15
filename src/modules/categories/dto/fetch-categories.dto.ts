import { IsNumber, IsOptional, IsString } from "class-validator";



export class FetchCategoriesDto {
   
   @IsOptional()
   @IsNumber()
   page?: number;

   @IsOptional()
   @IsNumber()
   limit?: number;

   @IsOptional()
   @IsString()
   search?: string;
}