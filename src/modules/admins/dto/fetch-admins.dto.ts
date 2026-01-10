import { MinLength, IsString, Min, IsNumber, IsOptional, IsEnum } from "class-validator";




export class FetchAdminsDto {
   @IsNumber()
   @IsOptional()
   @Min(1)
   page?: number;

   @IsNumber()
   @IsOptional()
   @Min(1)
   limit?: number;

   @IsString()
   @IsOptional()
   @MinLength(3)
   search?: string;

   @IsEnum(['SUPER_ADMIN', 'ADMIN'])
   @IsOptional()
   role?: 'SUPER_ADMIN' | 'ADMIN';
}