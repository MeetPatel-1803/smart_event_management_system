import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Event } from 'src/modules/events/entities/event.entity';
import {
  RegistrationStatus,
  UserEvent,
} from 'src/modules/events/entities/user-event.entity';
import { In, LessThan, Repository } from 'typeorm';
import { EventProducer } from '../queue/producers/event.producer';
import { CONSTANTS } from 'src/common/constants/app.constants';

interface RegistrationEvent {
  eventId: string;
  userIds: string[];
  // capacity: number;
  // bookedSeats: number;
}

@Injectable()
export class CronServices {
  constructor(
    @InjectRepository(UserEvent)
    private readonly userEvent: Repository<UserEvent>,

    @InjectRepository(Event)
    private readonly event: Repository<Event>,

    private readonly eventProducer: EventProducer,
  ) {}

  // This cron will run every 10 minutes and check for the registrations that are unpaid and have expiredAt < now.
  // If any such registrations are found, they will be released.
  @Cron(CronExpression.EVERY_10_MINUTES)
  async ExpireRegistration() {
    const expiredRegistrations = await this.userEvent
      .createQueryBuilder('userEvent')
      .where('userEvent.status = :status', {
        status: RegistrationStatus.PAYMENT_PENDING,
      })
      .andWhere('userEvent.expiresAt < :now', { now: new Date() })
      .select('userEvent.event_id', 'eventId')
      .addSelect('ARRAY_AGG(userEvent.user_id)', 'userIds')
      .groupBy('userEvent.event_id')
      .getRawMany();

    // Expire unpaid registrations and Release reserved seats.
    if (expiredRegistrations.length) {
      const eventIds = expiredRegistrations?.map(
        (data: RegistrationEvent) => data.eventId,
      );

      // Update booking status from PAYMENT_PENDING to EXPIRED & release the seats.
      await Promise.all(
        expiredRegistrations?.map((data: RegistrationEvent) =>
          this.userEvent.update(
            {
              eventId: data.eventId,
              userId: In(data.userIds),
              status: RegistrationStatus.PAYMENT_PENDING,
              expiresAt: LessThan(new Date()),
            },
            { status: RegistrationStatus.EXPIRED },
          ),
        ),
      );

      const results = await Promise.allSettled(
        eventIds.map((id) =>
          this.eventProducer.addEventWaitingListJob(
            CONSTANTS.EVENT_JOBS.PROCESS_NEXT_WAITING_USER,
            id,
          ),
        ),
      );

      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error('Waiting list processing failed', {
            eventId: eventIds[index],
            error: JSON.stringify(result.reason),
          });
        }
      });
    }
  }
}
