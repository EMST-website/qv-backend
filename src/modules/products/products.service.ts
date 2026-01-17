import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Injectable, Inject, BadRequestException, NotFoundException } from "@nestjs/common";
import { DATABASE_CONNECTION } from "@/database/database.provider";
import * as schema from "@/database/schema";
import { CreateProductDto } from "./dto/create-product.dto";
import { MediaService } from "@/common/utils/media/media.service";
import { products, productDetails, productsToCategories } from "./products.schema";
import { successResponse } from "@/common/utils/response/response";
import { and, count, eq, like, or } from "drizzle-orm";
import { UpdateProductDto } from "./dto/update-product.dto";
import { REDIS_CLIENT } from "@/cache/cache.service";
import { Redis } from "ioredis";

@Injectable()
export class ProductsService {
   constructor(
      @Inject(DATABASE_CONNECTION)
      private readonly db: NodePgDatabase<typeof schema>,
      @Inject(REDIS_CLIENT)
      private readonly redis: Redis,
      private readonly media_service: MediaService,
   ) { }

   public async create(form: CreateProductDto, file: Express.Multer.File) {
      if (!file) throw new BadRequestException('Image is required');

      // Upload image to cloudinary
      const image_url = await this.media_service.uploadImage(file.path);
      if (!image_url.secure_url) throw new BadRequestException('Failed to upload image');

      // Create product
      const product = await this.db.insert(products).values({
         name: form.name,
         description: form.description,
         image_url: image_url.secure_url,
         status: form.status,
      }).returning().then(result => result[0]);

      // Insert product details if provided
      if (form.details && form.details.length > 0) {
         await this.db.insert(productDetails).values(
            form.details.map(detail => ({
               product_id: product.id,
               label: detail.label,
               value: detail.value,
            }))
         );
      }

      // Insert product-category relationships if provided
      if (form.category_ids && form.category_ids.length > 0) {
         await this.db.insert(productsToCategories).values(
            form.category_ids.map(categoryId => ({
               product_id: product.id,
               category_id: categoryId,
            }))
         );
      }

      // Clear cache
      await this.redis.del('products_list');

      // Return success response
      return successResponse('Product created successfully', product);
   }

   public async findAll(filters: {
      page: number;
      limit: number;
      search?: string;
      category_id?: string;
      status?: string;
   }) {
      const { page, limit, search, category_id, status } = filters;
      const offset = (page - 1) * limit;

      // Build query
      const query = this.db.query.products.findMany({
         limit,
         offset,
         where: (products, { and, like, eq, or }) => {
            const conditions = [];

            if (search) {
               conditions.push(
                  or(
                     like(products.name, `%${search}%`),
                     like(products.description, `%${search}%`)
                  )
               );
            }

            if (status) {
               conditions.push(eq((products as any).status, status as any));
            }

            return conditions.length > 0 ? and(...conditions as any) : undefined;
         },
         with: {
            details: true,
            productsToCategories: {
               with: {
                  category: true,
               },
            },
         },
         orderBy: (products, { desc }) => [desc(products.created_at)],
      });

      // Execute query
      const products_list = await query;

      // Filter by category if provided
      let filtered_products = products_list;
      if (category_id) {
         filtered_products = products_list.filter(product =>
            product.productsToCategories.some(ptc => ptc.category_id === category_id)
         );
      }

      // Count total
      const [total_result] = await this.db
         .select({ count: count() })
         .from(products)
         .where(
            and(
               search ? or(
                  like(products.name, `%${search}%`),
                  like(products.description, `%${search}%`)
               ) : undefined,
               status ? eq(products.status, status as any) : undefined
            )
         );

      const total = total_result.count;

      return successResponse('Products fetched successfully', {
         products: filtered_products,
         pagination: {
            page,
            limit,
            total,
            total_pages: Math.ceil(total / limit),
         },
      });
   }

   public async findOne(id: string) {
      const product = await this.db.query.products.findFirst({
         where: eq(products.id, id),
         with: {
            details: true,
            productsToCategories: {
               with: {
                  category: true,
               },
            },
         },
      });

      if (!product) throw new NotFoundException('Product not found');

      return successResponse('Product fetched successfully', product);
   }

   public async update(id: string, form: UpdateProductDto, file?: Express.Multer.File) {
      // Check if product exists
      const existing_product = await this.db.query.products.findFirst({
         where: eq(products.id, id),
      });

      if (!existing_product) throw new NotFoundException('Product not found');

      let image_url = existing_product.image_url;

      // Upload new image if provided
      if (file) {
         const uploaded_image = await this.media_service.uploadImage(file.path);
         if (!uploaded_image.secure_url) throw new BadRequestException('Failed to upload image');
         image_url = uploaded_image.secure_url;
      }

      // Update product
      const updated_product = await this.db.update(products)
         .set({
            name: form.name,
            description: form.description,
            status: form.status,
            image_url,
            updated_at: new Date(),
         })
         .where(eq(products.id, id))
         .returning()
         .then(result => result[0]);

      // Update product details if provided
      if (form.details) {
         // Delete existing details
         await this.db.delete(productDetails).where(eq(productDetails.product_id, id));

         // Insert new details
         if (form.details.length > 0) {
            await this.db.insert(productDetails).values(
               form.details.map(detail => ({
                  product_id: id,
                  label: detail.label,
                  value: detail.value,
               }))
            );
         }
      }

      // Update product-category relationships if provided
      if (form.category_ids) {
         // Delete existing relationships
         await this.db.delete(productsToCategories).where(eq(productsToCategories.product_id, id));

         // Insert new relationships
         if (form.category_ids.length > 0) {
            await this.db.insert(productsToCategories).values(
               form.category_ids.map(categoryId => ({
                  product_id: id,
                  category_id: categoryId,
               }))
            );
         }
      }

      // Clear cache
      await this.redis.del('products_list');

      return successResponse('Product updated successfully', updated_product);
   }

   public async remove(id: string) {
      // Check if product exists
      const existing_product = await this.db.query.products.findFirst({
         where: eq(products.id, id),
      });

      if (!existing_product) throw new NotFoundException('Product not found');

      // Delete product (cascade will handle details and relationships)
      await this.db.delete(products).where(eq(products.id, id));

      // Clear cache
      await this.redis.del('products_list');

      return successResponse('Product deleted successfully', null);
   }
}
