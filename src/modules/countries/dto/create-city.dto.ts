import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import type { CityStatusEnum } from "../schema/cities.schema";



export class CreateCityDto {
   @IsString()
   @IsNotEmpty()
   name: string;

   @IsEnum(['ACTIVE', 'INACTIVE'])
   @IsOptional()
   status?: CityStatusEnum;
}