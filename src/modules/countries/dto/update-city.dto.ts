import { IsEnum, IsOptional, IsString } from "class-validator";
import type { CityStatusEnum } from "../schema/cities.schema";



export class UpdateCityDto {

   @IsString()
   @IsOptional()
   name?: string;

   @IsOptional()
   @IsEnum(['ACTIVE', 'INACTIVE'])
   status?: CityStatusEnum;
}