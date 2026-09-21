import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { CONSTANTS } from 'src/common/constants/app.constants';
import { Queue } from 'bullmq';

@Injectable()
export class EventProducer {
  constructor(
    @InjectQueue(CONSTANTS.QUEUE.EVENT_WAITING_LIST)
    private readonly eventWaitingListQueue: Queue,
  ) {}

  async addEventWaitingListJob(name: string, eventId: string) {
    return await this.eventWaitingListQueue.add(name, eventId);
  }
}
