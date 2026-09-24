import { Processor, WorkerHost } from '@nestjs/bullmq';
import { CONSTANTS } from 'src/common/constants/app.constants';
import { Job } from 'bullmq';
import { ApiError } from 'src/shared/response/apiError.service';
import { Event } from 'src/modules/events/entities/event.entity';
import {
  UserEvent,
  RegistrationStatus,
} from 'src/modules/events/entities/user-event.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Messages } from 'src/shared/messages/messages';
import { Helper } from 'src/common/helper/helper.service';

@Processor(CONSTANTS.QUEUE.EVENT_WAITING_LIST)
export class EventProcessor extends WorkerHost {
  constructor(
    @InjectRepository(UserEvent)
    private readonly userEvent: Repository<UserEvent>,
    @InjectRepository(Event)
    private readonly event: Repository<Event>,
  ) {
    super();
  }

  async process(job: Job<string>): Promise<any> {
    switch (job.name) {
      case CONSTANTS.EVENT_JOBS.PROCESS_NEXT_WAITING_USER:
        return await this.eventWaitingListWorker(job.data);

      default:
        throw new Error(`Unknown job name: ${job.name}`);
    }
  }

  async eventWaitingListWorker(eventId: string): Promise<void> {
    const userEventDetails = await this.userEvent.findOne({
      where: { eventId, status: RegistrationStatus.WAITLISTED },
      order: {
        createdAt: CONSTANTS.SORT.ASC,
      },
    });

    if (userEventDetails) {
      const result = (await this.event
        .createQueryBuilder('events')
        .leftJoin(
          'user_events',
          'userEvent',
          `userEvent.event_id = events.id
       AND userEvent.status IN (:...status)`,
          {
            status: [
              RegistrationStatus.REGISTERED,
              RegistrationStatus.PAYMENT_PENDING,
            ],
          },
        )
        .where('events.id = :eventId', { eventId })
        .select('events.capacity', 'capacity')
        .addSelect(
          'COALESCE(SUM(userEvent.noOfSeatsRequired), 0)',
          'bookedSeats',
        )
        .groupBy('events.id')
        .addGroupBy('events.capacity')
        .getRawOne()) as { capacity: number; bookedSeats: string };

      const capacity = result?.capacity || 0;
      const bookedSeats = Number(result?.bookedSeats) || 0;

      const availableSeats = capacity - bookedSeats;
      const requestedSeats = userEventDetails.noOfSeatsRequired;

      if (requestedSeats > availableSeats) {
        throw ApiError.badRequest(Messages.NOT_ENOUGH_SEATS(availableSeats));
      }

      userEventDetails.status = RegistrationStatus.PAYMENT_PENDING;
      userEventDetails.expiresAt = Helper.getPaymentWindowExpiration();

      await this.userEvent.save(userEventDetails);
    }

    // Further payment process.
  }
}
