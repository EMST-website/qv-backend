import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ProductsService } from "./products.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { multerConfigUploadImage } from "@/common/configs/multer.config";
import { AdminAuthGuard, AdminOrSuperAdminAuthGuard } from "@/common/guards/admin-auth.guard";
import { CreateProductDto } from "./dto/create-product.dto";
import { FetchProductsDto } from "./dto/fetch-products.dto";
import { UpdateProductDto } from "./dto/update-product.dto";

@Controller('products')
@ApiTags('products')
export class ProductsController {
   constructor(private readonly service: ProductsService) {}

   @Post()
   @UseGuards(AdminAuthGuard, AdminOrSuperAdminAuthGuard)
   @UseInterceptors(FileInterceptor('file', multerConfigUploadImage('../../../uploads')))
   async create(@Body() form: CreateProductDto, @UploadedFile() file: Express.Multer.File) {
      return await this.service.create(form, file);
   }

   @Get()
   @UseGuards(AdminAuthGuard, AdminOrSuperAdminAuthGuard)
   async findAll(@Query() query: FetchProductsDto) {
      const filters = {
         page: query.page ? parseInt(query.page.toString()) : 1,
         limit: query.limit ? parseInt(query.limit.toString()) : 10,
         search: query.search ? query.search.toString() : undefined,
         category_id: query.category_id ? query.category_id.toString() : undefined,
         status: query.status ? query.status.toString() : undefined,
      };
      return await this.service.findAll(filters);
   }

   @Get(':id')
   @UseGuards(AdminAuthGuard, AdminOrSuperAdminAuthGuard)
   async findOne(@Param('id', ParseUUIDPipe) id: string) {
      return await this.service.findOne(id);
   }

   @Put(':id')
   @UseGuards(AdminAuthGuard, AdminOrSuperAdminAuthGuard)
   @UseInterceptors(FileInterceptor('file', multerConfigUploadImage('../../../uploads')))
   async update(
      @Param('id', ParseUUIDPipe) id: string,
      @Body() form: UpdateProductDto,
      @UploadedFile() file: Express.Multer.File | undefined,
   ) {
      return await this.service.update(id, form, file);
   }

   @Delete(':id')
   @UseGuards(AdminAuthGuard, AdminOrSuperAdminAuthGuard)
   async remove(@Param('id', ParseUUIDPipe) id: string) {
      return await this.service.remove(id);
   }
}
