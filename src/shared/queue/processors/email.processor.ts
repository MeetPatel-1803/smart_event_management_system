import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CONSTANTS } from 'src/common/constants/app.constants';
import { EmailService } from 'src/modules/email/email.service';

@Processor(CONSTANTS.QUEUE.EMAIL_QUEUE)
export class EmailProcessor extends WorkerHost {
  constructor(private readonly emailService: EmailService) {
    super();
  }

  async process(
    job: Job<{
      paymentId: string;
      registrationId: string;
      userEmail: string;
      ticketPdfBase64: string;
    }>,
  ): Promise<any> {
    switch (job.name) {
      case CONSTANTS.EVENT_JOBS.SEND_CONFIRMATION_EMAIL:
        return await this.sendRegistrationConfirmationEmail(job.data);
      default:
        throw new Error(`Unknown job name: ${job.name}`);
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
      await this.emailService.sendTicketEmail(data.userEmail, pdfBuffer);
    } catch (err) {
      console.error('Failed to send email in EmailProcessor:', err);
      throw err;
    }
  }
}
