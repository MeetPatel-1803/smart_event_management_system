import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CONSTANTS } from 'src/common/constants/app.constants';
import { EmailService } from 'src/modules/email/email.service';
import { EventReminderEmailContext } from 'src/modules/email/interfaces/email.interface';

type ConfirmationEmailJobData = {
  paymentId: string;
  registrationId: string;
  userEmail: string;
  ticketPdfBase64: string;
};

type EventReminderJobData = {
  to: string;
  context: EventReminderEmailContext;
};

@Processor(CONSTANTS.QUEUE.EMAIL_QUEUE)
export class EmailProcessor extends WorkerHost {
  constructor(private readonly emailService: EmailService) {
    super();
  }

  async process(
    job: Job<ConfirmationEmailJobData | EventReminderJobData>,
  ): Promise<any> {
    switch (job.name) {
      case CONSTANTS.EVENT_JOBS.SEND_CONFIRMATION_EMAIL:
        return await this.sendRegistrationConfirmationEmail(
          job.data as ConfirmationEmailJobData,
        );
      case CONSTANTS.EVENT_JOBS.SEND_EVENT_REMINDER:
        return await this.sendEventReminderEmail(
          job.data as EventReminderJobData,
        );
      default:
        throw new Error(`Unknown job name: ${job.name}`);
    }
  }

  async sendEventReminderEmail(data: EventReminderJobData) {
    if (!data.to) {
      console.error('Missing recipient for event reminder email');
      return;
    }

    try {
      await this.emailService.sendEventReminderEmail(data.to, data.context);
    } catch (err) {
      console.error('Failed to send event reminder in EmailProcessor:', err);
      throw err;
    }
  }

  async sendRegistrationConfirmationEmail(data: {
    paymentId: string;
    registrationId: string;
    userEmail: string;
    ticketPdfBase64: string;
  }) {
    if (!data.userEmail || !data.ticketPdfBase64) {
      console.error('Missing email or ticket data');
      return;
    }

    try {
      const pdfBuffer = Buffer.from(data.ticketPdfBase64, 'base64');

      // TODO: enrich job payload with full event details so this context can
      // be populated properly and the template renders with real data.
      await this.emailService.sendTicketEmail(data.userEmail, pdfBuffer, {
        userName: '',
        eventName: '',
        eventDate: '',
        eventTime: '',
        eventLocation: '',
        eventType: '',
        eventUrl: '',
        registrationId: data.registrationId,
      });
    } catch (err) {
      console.error('Failed to send email in EmailProcessor:', err);
      throw err;
    }
  }
}
