import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { AdminPayload } from '@/common/types/payload';
import * as uuidv4 from 'uuid';
import * as crypto from 'crypto';

@Injectable()
export class JwtService {
   private readonly jwt_secret: string;
   constructor(
      private readonly configService: ConfigService
   ) {
      this.jwt_secret = this.configService.get<string>('JWT_SECRET_KEY') as string;
      if (!this.jwt_secret) {
         throw (new InternalServerErrorException('JWT_SECRET is not set'));
      }
   }

   assign_admin_tokens(payload: Partial<AdminPayload>) {
      // create the access token and refresh token
      const access_token = jwt.sign(payload, this.jwt_secret, { expiresIn: '1h' });
      // refresh token format is uuid.crypto4
      const refresh_token = `${uuidv4.v4()}.${crypto.randomBytes(64).toString('hex')}`;
      return { access_token, refresh_token };
   };

   public  verify_admin_token(token: string) {
      return jwt.verify(token, this.jwt_secret);
   };

   // generate a new access token for the admin
   public generate_admin_access_token(payload: Partial<AdminPayload>) {
      return jwt.sign(payload, this.jwt_secret, { expiresIn: '1h' });
   };
}