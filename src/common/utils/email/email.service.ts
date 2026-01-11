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
   };

   /**
    * Send an email to the admin when they are created
    * @param email - The email of the admin
    * @param password - The password of the admin
    * @returns The info of the email
    */
   async sendAdminCreatedEmail(email: string, password: string) {
      try {
         const info = await this.transporter.sendMail({
            from: this.configService.get<string>('GMAIL_USER'),
            to: email,
            subject: 'Admin Created',
            html: `
            <h1>Admin Created</h1>
            <p>Welcome to QV!</p>
            <p>Your password is ${password}</p>
            <p>Please use this password to login to your account.</p>
            <p>you have to change your password after or before first login, to secure your account.</p>
            <p>The QV Team.</p>
            <p>This is an automated email, please do not reply to this email.</p>
            <p>If you did not request this email, please ignore this email.</p>
            <p>Thank you for using QV!</p>
            <p>QV Admin Pannel URL:</p>
            <a href="${this.configService.get<string>('ADMIN_PANNEL')}">Admin Pannel</a>
            `,
         });

         return info;
      } catch (error) {
         throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
   }
};
