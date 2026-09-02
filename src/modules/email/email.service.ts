import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { CONSTANTS } from 'src/common/constants/app.constants';

// Note: will change the text and email template later.
@Injectable()
export class EmailService {
  constructor(private readonly mailService: MailerService) {}
  async sendWelcomeEmail(email: string) {
    try {
      await this.mailService.sendMail({
        to: email,
        from: process.env.EMAIL_USERNAME,
        subject: CONSTANTS.EMAIL.WELCOME.SUB,
        text: CONSTANTS.EMAIL.WELCOME.TEXT,
      });
    } catch (error) {
      console.error('Error sending welcome email:', error);
      throw error;
    }
  }

  async sendResetPasswordEmail(email: string, token: string): Promise<string> {
    try {
      const resetPasswordUrl = `${process.env.FRONTEND_URL}/api/v1/auth/reset-password?tokenId=${token}`;

      await this.mailService.sendMail({
        to: email,
        from: process.env.EMAIL_USERNAME,
        subject: CONSTANTS.EMAIL.RESET_PASSWORD.SUB,
        text: CONSTANTS.EMAIL.RESET_PASSWORD.TEXT(resetPasswordUrl),
      });

      return resetPasswordUrl;
    } catch (error) {
      console.error('Error sending reset password email:', error);
      throw error;
    }
  }
}
