import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Injectable, Inject, BadRequestException, NotFoundException } from "@nestjs/common";
import { DATABASE_CONNECTION } from "@/database/database.provider";
import * as schema from "@/database/schema";
import { CreateProductDto, ProductDetailDto } from "./dto/create-product.dto";
import { MediaService } from "@/common/utils/media/media.service";
import { products, productDetails, productsToCategories, ProductStatusEnum } from "./products.schema";
import { successResponse } from "@/common/utils/response/response";
import { and, count, desc, eq, inArray, like } from "drizzle-orm";
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

   /**
    * Add categories to a product in a transaction - helper function
    * @param tx - The transaction database connection
    * @param product_id - The product id
    * @param category_ids - The category ids
    */
   private async add_categories(tx: NodePgDatabase<typeof schema>, product_id: string, category_ids: string[]) {
      // Insert product-category relationships
      await tx.insert(productsToCategories).values(
         category_ids.map(categoryId => ({
            product_id: product_id,
            category_id: categoryId,
         }))
      );
   };

   /**
    * Add product details to a product in a transaction - helper function
    * @param tx - The transaction database connection
    * @param product_id - The product id
    * @param details - The product details
    */
   private async add_details(tx: NodePgDatabase<typeof schema>, product_id: string, details: ProductDetailDto[]) {
      // Insert product details
      await tx.insert(productDetails).values(
         details.map(detail => ({
            product_id: product_id,
            label: detail.label,
            value: detail.value,
         }))
      );
   };

   /**
    * Create a new product
    * @param form - The form data
    * @param file - The image file
    */
   public async create(form: CreateProductDto, file: Express.Multer.File) {
      if (!file) throw new BadRequestException('Image is required');

      // Upload image to cloudinary
      const image_url = await this.media_service.uploadImage(file.path);
      if (!image_url.secure_url) throw new BadRequestException('Failed to upload image');

      // Create product
      const result = await this.db.transaction(async (tx) => {
         // Insert product
         const new_product = await this.db.insert(products).values({
            title: form.title,
            description: form.description,
            image_url: image_url.secure_url,
            status: form.status,
         }).returning().then(result => result[0]);

         // Add product details if provided
         if (form.details && form.details.length > 0) {
            await this.add_details(tx, new_product.id, form.details);
         }

         // Add product-category relationships if provided
         await this.add_categories(tx, new_product.id, form.category_ids);

         // fetch product with details and categories
         const fetch_product = await tx.query.products.findFirst({
            where: eq(products.id, new_product.id),
            with: {
               details: true,
               productsToCategories: {
                  with: {
                     category: {
                        columns: {
                           id: true,
                           title: true
                        }
                     }
                  }
               },
            },
         }).then((result) => {
            if (!result) return;
            const { details, productsToCategories, ...product } = result;
            return ({
               ...product,
               details,
               categories: productsToCategories.map(cat => ({
                  id: cat.category.id,
                  title: cat.category.title
               }))
            });
         });

         // Return new product
         return (fetch_product);
      });

      // Return success response
      return (successResponse('Product created successfully', result));
   }

   /**
    * Find all products
    * @param filters - The filters
    */
   public async findAll(filters: {
      page: number;
      limit: number;
      search?: string;
      category_id?: string;
      status?: ProductStatusEnum;
   }) {
      const { page, limit, search, category_id, status } = filters;
      const offset = (page - 1) * limit;

      // Fetch products and total count
      const [products_db, total] = await Promise.all([
         this.db.query.products.findMany({
            limit,
            offset,
            where: and(
               ...(search ? [like(products.title, `%${search}%`)] : []),
               ...(category_id ? [inArray(productsToCategories.category_id, [category_id])] : []),
               ...(status ? [eq(products.status, status)] : []),
            ),
            orderBy: [desc(products.created_at)],
         }),
         this.db.select({ count: count() }).from(products).where(
            and(
               ...(search ? [like(products.title, `%${search}%`)] : []),
               ...(category_id ? [inArray(productsToCategories.category_id, [category_id])] : []),
               ...(status ? [eq(products.status, status)] : []),
            )
         ).then(result => result[0].count),
      ]);

      // Format products data
      const result = {
         products: products_db,
         pagination: {
            total,
            total_pages: Math.ceil(total / limit),
            page,
            limit,
            has_next: page < Math.ceil(total / limit),
            has_previous: page > 1,
         }
      };

      // Return success response
      return (successResponse('Products fetched successfully', result));
   }

   /**
    * Find a product by id
    * @param id - The product id
    */
   public async findOne(id: string) {
      // Fetch product with details and categories
      const product_db = await this.db.query.products.findFirst({
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

      // If product not found, throw an error
      if (!product_db) throw new NotFoundException('Product not found');

      // Format product data
      const result = () => {
         const { details, productsToCategories, ...product } = product_db;
         return (({
            ...product,
            details,
            categories: productsToCategories.map(cat => ({
               id: cat.category.id,
               title: cat.category.title
            }))
         }));
      }

      // Return success response
      return (successResponse('Product fetched successfully', result()));
   }

   /**
    * Update a product
    * @param id - The product id
    * @param form - The form data
    * @param file - The image file
    */
   public async update(id: string, form: UpdateProductDto, file?: Express.Multer.File) {
      // Check if product exists
      const existing_product = await this.db.query.products.findFirst({
         where: eq(products.id, id),
      });

      if (!existing_product) throw new NotFoundException('Product not found');

      let image_url = existing_product.image_url;

      // Upload new image if provided
      if (file) {
         // upload new image
         const uploaded_image = await this.media_service.uploadImage(file.path);
         if (!uploaded_image.secure_url) throw new BadRequestException('Failed to upload image');

         // remove existing image if provided
         if (existing_product.image_url) await this.media_service.deleteImage(existing_product.image_url);

         // set new image url
         image_url = uploaded_image.secure_url;
      }

      // Update product
      const result = await this.db.transaction(async (tx) => {
         // Update product
         const updated_product = await tx.update(products)
         .set({
            title: form.title,
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
            // Remove existing details
            await tx.delete(productDetails).where(eq(productDetails.product_id, updated_product.id));

            // Add new details if provided
            if (form.details.length > 0) {
               await this.add_details(tx, updated_product.id, form.details);
            }
         }

         // Update product-category relationships if provided
         if (form.category_ids) {
            // Remove existing relationships
            await tx.delete(productsToCategories).where(eq(productsToCategories.product_id, updated_product.id));

            // Add new relationships if provided
            if (form.category_ids.length > 0) {
               await this.add_categories(tx, updated_product.id, form.category_ids);
            }
         }

         // Fetch updated product with details and categories
         const fetch_product = await tx.query.products.findFirst({
            where: eq(products.id, updated_product.id),
            with: {
               details: true,
               productsToCategories: {
                  with: {
                     category: true,
                  },
               },
            },
         }).then(result => {
            if (!result) return;
            const { details, productsToCategories, ...product } = result;
            return ({
               ...product,
               details,
               categories: productsToCategories.map(cat => ({
                  id: cat.category.id,
                  title: cat.category.title
               }))
            });
         });

         // Return updated product
         return (fetch_product);
      });

      // Return success response
      return (successResponse('Product updated successfully', result));
   }

   /**
    * Remove a product
    * @param id - The product id
    */
   public async remove(id: string) {
      // Check if product exists
      const existing_product = await this.db.query.products.findFirst({
         where: eq(products.id, id),
      });

      if (!existing_product) throw new NotFoundException('Product not found');

      // Delete product (cascade will handle details and relationships)
      await this.db.delete(products).where(eq(products.id, id));

      // Remove image if provided
      if (existing_product.image_url) await this.media_service.deleteImage(existing_product.image_url);

      // Return success response
      return (successResponse('Product deleted successfully'));
   }
}
