import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
   private transporter: nodemailer.Transporter;

   constructor(
      private readonly configService: ConfigService
   ) {
      this.transporter = nodemailer.createTransport({
         service: 'gmail',
         auth: {
            user: this.configService.get<string>('GMAIL_USER'),
            pass: this.configService.get<string>('GMAIL_PASS'),
         },
      });
   };

   async sendOTP(email: string, otp: string) {
      try {
         const info = await this.transporter.sendMail({
            from: this.configService.get<string>('GMAIL_USER'),
            to: email,
            subject: 'Your OTP for QV',
            html: `
            <h1>Your OTP is ${otp}</h1>
            <p>This OTP will expire in 5 minutes.</p>
            <p>Thank you for using QV!</p>
            <p>The QV Team.</p>
            <p>This is an automated email, please do not reply to this email.</p>
            <p>If you did not request this OTP, please ignore this email.</p>
         `,
         });

         return info;
      } catch (error) {
         throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
   }
};
