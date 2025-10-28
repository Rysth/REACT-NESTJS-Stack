import { Injectable, Logger } from "@nestjs/common";
import * as nodemailer from "nodemailer";

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.initializeTransporter();
    this.logger.log("EmailService initialized");
  }

  private initializeTransporter() {
    // For development, use ethereal email (fake SMTP service)
    // In production, configure with real SMTP settings
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || "smtp.ethereal.email",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || "ethereal.user@ethereal.email",
        pass: process.env.SMTP_PASS || "ethereal.pass",
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const info = await this.transporter.sendMail({
        from: process.env.FROM_EMAIL || '"Auth System" <noreply@example.com>',
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });

      this.logger.log(
        `Email sent successfully to ${options.to}: ${info.messageId}`
      );

      // For development with ethereal email, log the preview URL
      if (process.env.NODE_ENV === "development") {
        this.logger.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      }
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}:`, error);
      throw new Error(
        `Email sending failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async sendVerificationEmail(
    email: string,
    token: string,
    username: string
  ): Promise<void> {
    const verificationUrl = `${
      process.env.FRONTEND_URL || "http://localhost:5173"
    }/auth/verify-email/${token}`;

    const html = this.getVerificationEmailTemplate(username, verificationUrl);
    const text = `Hello ${username},\n\nPlease verify your email address by clicking the following link:\n${verificationUrl}\n\nThis link will expire in 24 hours.\n\nIf you didn't create an account, please ignore this email.`;

    await this.sendEmail({
      to: email,
      subject: "Verify Your Email Address",
      html,
      text,
    });
  }

  async sendPasswordResetEmail(
    email: string,
    token: string,
    username: string
  ): Promise<void> {
    const resetUrl = `${
      process.env.FRONTEND_URL || "http://localhost:5173"
    }/auth/reset-password/${token}`;

    const html = this.getPasswordResetEmailTemplate(username, resetUrl);
    const text = `Hello ${username},\n\nYou requested a password reset. Click the following link to reset your password:\n${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.`;

    await this.sendEmail({
      to: email,
      subject: "Reset Your Password",
      html,
      text,
    });
  }

  private getVerificationEmailTemplate(
    username: string,
    verificationUrl: string
  ): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Verify Your Email</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f8f9fa; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .button { 
              display: inline-block; 
              padding: 12px 24px; 
              background-color: #007bff; 
              color: white; 
              text-decoration: none; 
              border-radius: 4px; 
              margin: 20px 0; 
            }
            .footer { font-size: 12px; color: #666; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Email Verification</h1>
            </div>
            <div class="content">
              <p>Hello ${username},</p>
              <p>Thank you for creating an account! Please verify your email address by clicking the button below:</p>
              <p style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </p>
              <p>Or copy and paste this link into your browser:</p>
              <p><a href="${verificationUrl}">${verificationUrl}</a></p>
              <p>This verification link will expire in 24 hours.</p>
              <p>If you didn't create an account, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>This is an automated message, please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private getPasswordResetEmailTemplate(
    username: string,
    resetUrl: string
  ): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Reset Your Password</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f8f9fa; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .button { 
              display: inline-block; 
              padding: 12px 24px; 
              background-color: #dc3545; 
              color: white; 
              text-decoration: none; 
              border-radius: 4px; 
              margin: 20px 0; 
            }
            .footer { font-size: 12px; color: #666; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset</h1>
            </div>
            <div class="content">
              <p>Hello ${username},</p>
              <p>You requested a password reset for your account. Click the button below to reset your password:</p>
              <p style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </p>
              <p>Or copy and paste this link into your browser:</p>
              <p><a href="${resetUrl}">${resetUrl}</a></p>
              <p>This reset link will expire in 1 hour.</p>
              <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
            </div>
            <div class="footer">
              <p>This is an automated message, please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}
