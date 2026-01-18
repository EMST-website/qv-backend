import { IsEnum, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import type { StoryStatusEnum } from "../stories.schema";

export class UpdateStoryDto {
   @ApiProperty({
      description: 'Publication status of the story. Admin can only change status. Can be PUBLISHED or UNPUBLISHED.',
      enum: ['PUBLISHED', 'UNPUBLISHED'],
      example: 'PUBLISHED'
   })
   @IsEnum(['PUBLISHED', 'UNPUBLISHED'])
   @IsNotEmpty()
   status: StoryStatusEnum;
}
