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
         const result = await this.cloudinary.uploader.upload(filePath, { 
            folder,
            resource_type: 'image'
         });
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

   async uploadVideo(filePath: string, folder: string = 'uploads'): Promise<UploadApiResponse> {
      try {
         const result = await this.cloudinary.uploader.upload(filePath, { 
            folder,
            resource_type: 'video'
         });
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
         throw new InternalServerErrorException(error?.message || 'Failed to upload video');
      }
   };

   async uploadMedia(filePath: string, fileType: 'IMG' | 'VIDEO', folder: string = 'uploads'): Promise<UploadApiResponse> {
      if (fileType === 'VIDEO') {
         return (this.uploadVideo(filePath, folder));
      }
      return (this.uploadImage(filePath, folder));
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

   async deleteVideo(video_url: string) {
      // get public id from video_url
      const public_id = video_url.split('/').pop()?.split('.')[0];
      if (!public_id) throw new BadRequestException('Invalid video URL');

      // delete video from cloudinary
      await this.cloudinary.uploader.destroy(public_id, { resource_type: 'video' });

      // return success response
      return (true);
   };

   async deleteMedia(media_url: string, fileType: 'IMG' | 'VIDEO') {
      if (fileType === 'VIDEO') {
         return this.deleteVideo(media_url);
      }
      return this.deleteImage(media_url);
   };
}