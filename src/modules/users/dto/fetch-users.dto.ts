import { IsNumber, IsOptional, Min, IsString, Max, IsUUID } from "class-validator";




export class FetchUsersDto {

   @IsOptional()
   @IsNumber()
   @Min(1)
   page?: number;

   @IsOptional()
   @IsNumber()
   @Min(1)
   @Max(100)   
   limit?: number;

   @IsOptional()
   @IsString()
   search?: string;

   @IsOptional()
   @IsUUID()
   country_id?: string;

   @IsOptional()
   @IsUUID()
   city_id?: string;

   @IsOptional()
   @IsUUID()
   organization_id?: string;
}