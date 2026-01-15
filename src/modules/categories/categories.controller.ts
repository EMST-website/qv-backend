import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CategoriesService } from "./categories.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { multerConfigUploadImage } from "@/common/configs/multer.config";
import { AdminAuthGuard, AdminOrSuperAdminAuthGuard } from "@/common/guards/admin-auth.guard";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { FetchCategoriesDto } from "./dto/fetch-categories.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";



@Controller('categories')
@ApiTags('categories')
export class CategoriesController {
   constructor(private readonly service: CategoriesService) {}

   @Post()
   @UseGuards(AdminAuthGuard, AdminOrSuperAdminAuthGuard)
   @UseInterceptors(FileInterceptor('file', multerConfigUploadImage('../../../uploads')))
   async create(@Body() form: CreateCategoryDto, @UploadedFile() file: Express.Multer.File) {
      return (await this.service.create(form, file));
   };

   @Get()
   @UseGuards(AdminAuthGuard, AdminOrSuperAdminAuthGuard)
   async findAll(@Query() query: FetchCategoriesDto) {
      const filters = {
         page: query.page ? parseInt(query.page.toString()) : 1,
         limit: query.limit ? parseInt(query.limit.toString()) : 10,
         search: query.search ? query.search.toString() : undefined,
      };
      return (await this.service.findAll(filters));
   };

   @Get(':id')
   @UseGuards(AdminAuthGuard, AdminOrSuperAdminAuthGuard)
   async findOne(@Param('id', ParseUUIDPipe) id: string) {
      return (await this.service.findOne(id));
   };

   @Put(':id')
   @UseGuards(AdminAuthGuard, AdminOrSuperAdminAuthGuard)
   @UseInterceptors(FileInterceptor('file', multerConfigUploadImage('../../../uploads')))
   async update(
      @Param('id', ParseUUIDPipe) id: string,
      @Body() form: UpdateCategoryDto,
      @UploadedFile() file: Express.Multer.File | undefined,
   ) {
      return (await this.service.update(id, form, file));
   };

   @Delete(':id')
   @UseGuards(AdminAuthGuard, AdminOrSuperAdminAuthGuard)
   async delete(@Param('id', ParseUUIDPipe) id: string) {
      return (await this.service.delete(id));
   };

   @Get('list')
   @UseGuards(AdminAuthGuard, AdminOrSuperAdminAuthGuard)
   async list() {
      return (await this.service.list());
   };
};
