import { ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { CreateProductDto } from "./create-product.dto";

export class UpdateProductDto extends PartialType(CreateProductDto) {
   @ApiPropertyOptional({
      description: 'Product image file. Optional for updates. Accepts image files (JPEG, PNG, WebP). If provided, replaces the existing image.',
      type: 'string',
      format: 'binary'
   })
   file?: Express.Multer.File;
}
