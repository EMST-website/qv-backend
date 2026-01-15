import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { v2 as Cloudinary, UploadApiResponse } from "cloudinary";
import { CloudinaryConfig } from "./cloudinary.config";
import * as fs from 'fs/promises';

@Injectable()
export class MediaService {
   private readonly cloudinary: typeof Cloudinary;

   constructor(
      private readonly config: ConfigService
   ) {
      this.cloudinary = CloudinaryConfig(config);
   }

   async uploadImage(filePath: string, folder: string = 'uploads'): Promise<UploadApiResponse> {
      try {
         const result = await this.cloudinary.uploader.upload(filePath, { folder });
         // Delete the file from the server after successful upload
         try {
            await fs.unlink(filePath);
         } catch (err: any) {
            console.error('Error deleting file:', err);
         }
         return result;
      } catch (error: any) {
         // Delete the file from the server on error
         try {
            await fs.unlink(filePath);
         } catch (err: any) {
            console.error('Error deleting file:', err);
         }
         throw new InternalServerErrorException(error?.message || 'Failed to upload image');
      }
   };

   async deleteImage(image_url: string) {
      // get public id from image_url
      const public_id = image_url.split('/').pop()?.split('.')[0];
      if (!public_id) throw new BadRequestException('Invalid image URL');

      // delete image from cloudinary
      await this.cloudinary.uploader.destroy(public_id);

      // return success response
      return (true);
   };
}