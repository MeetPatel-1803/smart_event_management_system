import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { CONSTANTS } from 'src/common/constants/app.constants';
import { JobsOptions, Queue } from 'bullmq';

@Injectable()
export class QueueProducer {
  constructor(
    @InjectQueue(CONSTANTS.QUEUE.EVENT_WAITING_LIST)
    private readonly eventWaitingListQueue: Queue,
    @InjectQueue(CONSTANTS.QUEUE.EMAIL_QUEUE)
    private readonly emailQueue: Queue,
    @InjectQueue(CONSTANTS.QUEUE.QR_CODE_QUEUE)
    private readonly qrCodeQueue: Queue,
  ) {}

  async addEventWaitingListJob(name: string, eventId: string) {
    return await this.eventWaitingListQueue.add(name, eventId);
  }

  async addEmailJob(name: string, payload: any, options?: JobsOptions) {
    return await this.emailQueue.add(name, payload, options);
  }

  async addQrCodeJob(name: string, payload: any) {
    return await this.qrCodeQueue.add(name, payload);
  }
}
