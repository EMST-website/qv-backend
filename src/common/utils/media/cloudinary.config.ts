import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import { ConfigService } from '@nestjs/config';

dotenv.config();

// using config service to get the credentials
export const CloudinaryConfig = (config: ConfigService) => {
   const CLOUDINARY_NAME = config.get('CLOUDINARY_NAME');
   const CLOUDINARY_API_KEY = config.get('CLOUDINARY_API_KEY');
   const CLOUDINARY_API_SECRET = config.get('CLOUDINARY_API_SECRET');

   // Validate Cloudinary credentials are present
   if (!CLOUDINARY_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
      throw new Error(
         'Missing required Cloudinary configuration (CLOUDINARY_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)',
      );
   }

   cloudinary.config({
      cloud_name: CLOUDINARY_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
   });
   return cloudinary;
};
