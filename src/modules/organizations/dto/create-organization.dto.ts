import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import type { OrganizationStatusEnum } from '../organizations.schema';

export class CreateOrganizationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsUUID()
  @IsNotEmpty()
  country_id: string;

  @IsUUID()
  @IsNotEmpty()
  city_id: string;

  @IsEnum(['ACTIVE', 'INACTIVE'])
  @IsNotEmpty()
  status: OrganizationStatusEnum;
};
