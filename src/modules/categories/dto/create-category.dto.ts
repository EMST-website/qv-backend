import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import type { CategoryStatusEnum } from "../categories.schema";




export class CreateCategoryDto {
   @IsString()
   @IsNotEmpty()
   title: string;

   @IsEnum(['ACTIVE', 'INACTIVE'])
   @IsNotEmpty()
   status: CategoryStatusEnum;
};
