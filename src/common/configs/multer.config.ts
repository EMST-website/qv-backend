import { BadRequestException } from "@nestjs/common";
import { diskStorage } from "multer";
import { resolve } from "path";
import { Request } from "express";



/**
 * Multer configuration for uploading images
 * @param folderPath - The path to the folder where the images will be uploaded
 * @returns Multer configuration
 */
export function multerConfigUploadImage(folderPath: string) {
   return ({
      storage: diskStorage({
         destination: resolve(folderPath),
         filename: (req, file, callback) => {
            callback(null, `${Date.now()}-${Math.round(Math.random() * 1000000)}-${file.originalname}`);
         },  
      }),
      fileFilter: (req: Request, file: Express.Multer.File, callback: (error: Error | null, acceptFile: boolean) => void) => {
         if (file.mimetype.startsWith('image/')) {
            callback(null, true);
         } else {
            callback(new BadRequestException('Invalid file type'), false);
         }
      },
      limits: {
         fileSize: 1024 * 1024 * 10, // 10MB
      },
   });
}