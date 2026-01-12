import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import type { OrganizationStatusEnum } from '../organizations.schema';

export class UpdateOrganizationDto {

   @IsOptional()
   @IsString()
   name?: string;

   @IsOptional()
   @IsUUID()
   country_id?: string;

   @IsOptional()
   @IsUUID()
   city_id?: string;

   @IsOptional()
   @IsEnum(['ACTIVE' , 'INACTIVE'])
   status?: OrganizationStatusEnum;
}
