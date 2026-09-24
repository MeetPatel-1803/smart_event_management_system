import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CONSTANTS } from 'src/common/constants/app.constants';
import * as QRCode from 'qrcode';
import PDFDocument from 'pdfkit';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEvent } from 'src/modules/events/entities/user-event.entity';
import { Repository } from 'typeorm';
import { QueueProducer } from '../producers/queue.producer';

@Processor(CONSTANTS.QUEUE.QR_CODE_QUEUE)
export class QrProcessor extends WorkerHost {
  constructor(
    private readonly queueProducer: QueueProducer,
    @InjectRepository(UserEvent)
    private readonly userEventRepository: Repository<UserEvent>,
  ) {
    super();
  }

  async process(
    job: Job<{ paymentId: string; registrationId: string }>,
  ): Promise<any> {
    switch (job.name) {
      case CONSTANTS.EVENT_JOBS.GENERATE_QR_CODE:
        return await this.generateQrAndTicket(job.data);
      default:
        throw new Error(`Unknown job name: ${job.name}`);
    }
  }

  async generateQrAndTicket(data: {
    paymentId: string;
    registrationId: string;
  }) {
    const { paymentId, registrationId } = data;

    try {
      // 1. Generate QR Code
      const qrData = JSON.stringify({ paymentId, registrationId });
      const qrCodeDataUrl = await QRCode.toDataURL(qrData);

      // Fetch user event to get user details for email later
      const userEvent = await this.userEventRepository.findOne({
        where: { id: registrationId },
        relations: {
          user: true,
          event: true,
        },
      });

      // 2. Generate PDF Ticket
      const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
        const doc = new PDFDocument();
        const chunks: Buffer[] = [];
        doc.on('data', (chunk: Buffer) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        doc.fontSize(25).text('Event Ticket', 100, 100);
        if (userEvent?.event) {
          doc
            .fontSize(15)
            .text(
              `Event: ${userEvent.event.name || userEvent.eventId}`,
              100,
              150,
            );
        }
        doc.fontSize(12).text(`Registration ID: ${registrationId}`, 100, 170);
        doc.fontSize(12).text(`Payment ID: ${paymentId}`, 100, 190);
        if (userEvent?.user) {
          doc
            .fontSize(12)
            .text(`Attendee: ${userEvent.user.name || ''}`, 100, 210);
        }

        const base64Data = qrCodeDataUrl.replace(
          /^data:image\/png;base64,/,
          '',
        );
        const imgBuffer = Buffer.from(base64Data, 'base64');

        doc.image(imgBuffer, 100, 250, { fit: [150, 150] });

        doc.end();
      });

      // 3. Add to email queue
      await this.queueProducer.addEmailJob(
        CONSTANTS.EVENT_JOBS.SEND_CONFIRMATION_EMAIL,
        {
          paymentId,
          registrationId,
          userEmail: userEvent?.user?.email,
          ticketPdfBase64: pdfBuffer.toString('base64'),
        },
      );

      return true;
    } catch (err) {
      console.error('Error in QrProcessor:', err);
      throw err;
    }
  }
}
