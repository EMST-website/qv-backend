import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // For development, we use a mock transport or a simple Ethereal account if configured.
    // For this setup, we'll log the email to the console to simulate "sending" without needing credentials.
    // In production, configure this with process.env.SMTP_HOST, etc.
    this.transporter = nodemailer.createTransport({
      jsonTransport: true, // Logs to console in JSON format
    });
  }

  async sendActivationEmail(email: string, token: string) {
    const activationLink = `qv-mobile://activate?token=${token}`;

    // In a real app, you would render an HTML template here.
    const info = await this.transporter.sendMail({
      from: '"QV App" <noreply@qv.app>',
      to: email,
      subject: 'Welcome to QV Team - Activate your Account',
      html: `
        <h1>Welcome to QV!</h1>
        <p>You have been invited to join the QV Mobile Application for Healthcare Professionals.</p>
        <p>Please click the link below on your mobile device to set your password and complete your profile:</p>
        <a href="${activationLink}">Activate Account</a>
        <br />
        <p>If the link above does not work, copy and paste this into your browser/mobile:</p>
        <p>${activationLink}</p>
      `,
    });

    console.log(
      `[EmailService] Activation email sent to ${email}. Token: ${token}`,
    );
    console.log(`[EmailService] Link: ${activationLink}`);

    return info;
  }
}
