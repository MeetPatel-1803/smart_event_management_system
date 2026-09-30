import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { CONSTANTS } from 'src/common/constants/app.constants';
import {
  baseContext,
  EventCancelledEmailContext,
  EventReminderEmailContext,
  RegistrationConfirmationEmailContext,
  ResetPasswordEmailContext,
  SendMailOptions,
  WaitlistPromotionEmailContext,
  WelcomeEmailContext,
} from './interfaces/email.interface';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly mailerService: MailerService) {}

  private async sendMail<T extends Record<string, unknown>>(
    options: SendMailOptions<T>,
  ): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: options.to,
        from: process.env.EMAIL_USERNAME,
        subject: options.subject,
        template: options.template,
        context: options.context,
        ...(options.attachments && { attachments: options.attachments }),
      });
      this.logger.log(
        `Email "${options.subject}" sent successfully to ${options.to}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send email "${options.subject}" to ${options.to}`,
        error,
      );
      throw error;
    }
  }

  /** welcome.template.hbs */
  async sendWelcomeEmail(
    to: string,
    context: WelcomeEmailContext,
  ): Promise<void> {
    await this.sendMail({
      to,
      subject: CONSTANTS.EMAIL.WELCOME.SUB,
      template: 'welcome',
      context: context as unknown as Record<string, unknown>,
    });
  }

  /** Uses reset-password logic; no dedicated .hbs template yet — plain text approach kept */
  async sendResetPasswordEmail(
    to: string,
    token: string,
    context?: Partial<ResetPasswordEmailContext>,
  ): Promise<string> {
    const resetPasswordUrl = `${process.env.FRONTEND_URL}/api/v1/auth/reset-password?tokenId=${token}`;

    await this.sendMail({
      to,
      subject: CONSTANTS.EMAIL.RESET_PASSWORD.SUB,
      template: 'reset-password',
      context: {
        ...context,
        resetPasswordUrl,
      },
    });

    return resetPasswordUrl;
  }

  /** event-reminder.template.hbs */
  async sendEventReminderEmail(
    to: string,
    context: EventReminderEmailContext,
  ): Promise<void> {
    await this.sendMail({
      to,
      subject: CONSTANTS.EMAIL.EVENT_REMINDER.SUB,
      template: 'event-reminder',
      context: context as unknown as Record<string, unknown>,
    });
  }

  /** event-cancelled.template.hbs */
  async sendEventCancelledEmail(
    to: string,
    context: EventCancelledEmailContext,
  ): Promise<void> {
    await this.sendMail({
      to,
      subject: CONSTANTS.EMAIL.EVENT_CANCELLED.SUB,
      template: 'event-cancelled',
      context: context as unknown as Record<string, unknown>,
    });
  }

  /** waitlist-promotion.template.hbs */
  async sendWaitlistPromotionEmail(
    to: string,
    context: WaitlistPromotionEmailContext,
  ): Promise<void> {
    await this.sendMail({
      to,
      subject: CONSTANTS.EMAIL.WAITLIST_PROMOTION.SUB,
      template: 'waitlist-promotion',
      context: context as unknown as Record<string, unknown>,
    });
  }

  /** Sends a ticket PDF as an attachment (uses registration-confirmation template) */
  async sendTicketEmail(
    to: string,
    ticketPdf: Buffer,
    context: Omit<RegistrationConfirmationEmailContext, keyof baseContext> &
      Partial<baseContext>,
  ): Promise<void> {
    await this.sendMail({
      to,
      subject: CONSTANTS.EMAIL.SEND_TICKET.SUB,
      template: 'registration-confirmation',
      context,
      attachments: [
        {
          filename: CONSTANTS.EMAIL.SEND_TICKET.FILE_NAME,
          content: ticketPdf,
          contentType: 'application/pdf',
        },
      ],
    });
  }
}
