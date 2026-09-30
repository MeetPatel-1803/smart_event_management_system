import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Event, EventStatus } from 'src/modules/events/entities/event.entity';
import {
  RegistrationStatus,
  UserEvent,
} from 'src/modules/events/entities/user-event.entity';
import { In, LessThan, Repository } from 'typeorm';
import { QueueProducer } from '../queue/producers/queue.producer';
import { CONSTANTS } from 'src/common/constants/app.constants';
import { EventReminderEmailContext } from 'src/modules/email/interfaces/email.interface';

interface RegistrationEvent {
  eventId: string;
  userIds: string[];
  // capacity: number;
  // bookedSeats: number;
}

const KOLKATA_TZ = 'Asia/Kolkata';
const REMINDER_WINDOW_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class CronServices {
  private readonly logger = new Logger(CronServices.name);

  constructor(
    @InjectRepository(UserEvent)
    private readonly userEvent: Repository<UserEvent>,

    @InjectRepository(Event)
    private readonly event: Repository<Event>,

    private readonly queueProducer: QueueProducer,
  ) {}

  private buildReminderContext(
    registration: UserEvent,
  ): EventReminderEmailContext {
    const { event, user } = registration;
    const { eventDate, eventTime } = this.formatEventDateTime(event.startTime);

    return {
      userName: user.name,
      eventName: event.name,
      eventDate,
      eventTime,
      eventLocation: event.location,
      eventType: event.category,
      eventUrl: `${process.env.FRONTEND_URL}/events/${event.id}`,
      registrationId: registration.id,
      timeUntilEvent: this.getTimeUntilEvent(event.startTime),
      supportEmail: process.env.SUPPORT_EMAIL!,
      year: Number(process.env.YEAR!),
    };
  }

  private formatEventDateTime(startTime: Date): {
    eventDate: string;
    eventTime: string;
  } {
    return {
      eventDate: new Intl.DateTimeFormat('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: KOLKATA_TZ,
      }).format(startTime),
      eventTime: new Intl.DateTimeFormat('en-IN', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: KOLKATA_TZ,
        timeZoneName: 'short',
      }).format(startTime),
    };
  }

  private getTimeUntilEvent(startTime: Date): string {
    const diffMs = startTime.getTime() - Date.now();
    if (diffMs <= 0) {
      return 'Starting soon';
    }

    const hours = Math.floor(diffMs / (60 * 60 * 1000));
    const minutes = Math.round((diffMs % (60 * 60 * 1000)) / (60 * 1000));

    if (hours < 1) {
      return minutes <= 1
        ? 'Starting in 1 minute'
        : `Starting in ${minutes} minutes`;
    }

    if (hours < 24) {
      return hours === 1 ? 'Starts in 1 hour' : `Starts in ${hours} hours`;
    }

    const days = Math.floor(hours / 24);
    return days === 1 ? 'Starts tomorrow' : `Starts in ${days} days`;
  }

  private getKolkataDateKey(date: Date): string {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: KOLKATA_TZ,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  }

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
      .orWhere('userEvent.status = :status', {
        status: RegistrationStatus.FAILED,
      })
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
          this.userEvent.delete({
            eventId: data.eventId,
            userId: In(data.userIds),
            status: RegistrationStatus.PAYMENT_PENDING,
            expiresAt: LessThan(new Date()),
          }),
        ),
      );

      const results = await Promise.allSettled(
        eventIds.map((id) =>
          this.queueProducer.addEventWaitingListJob(
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

  // Daily 9:00 AM IST: remind REGISTERED attendees of published events starting in the next 24 hours.
  @Cron(CronExpression.EVERY_DAY_AT_9AM, { timeZone: KOLKATA_TZ })
  async sendUpcomingEventReminders() {
    const now = new Date();
    const windowEnd = new Date(now.getTime() + REMINDER_WINDOW_MS);

    const registrations = await this.userEvent
      .createQueryBuilder('userEvent')
      .innerJoinAndSelect('userEvent.user', 'user')
      .innerJoinAndSelect('userEvent.event', 'event')
      .where('userEvent.status = :status', {
        status: RegistrationStatus.REGISTERED,
      })
      .andWhere('event.status = :eventStatus', {
        eventStatus: EventStatus.PUBLISHED,
      })
      .andWhere('event.startTime >= :now', { now })
      .andWhere('event.startTime < :windowEnd', { windowEnd })
      .getMany();

    if (!registrations.length) {
      this.logger.log('No upcoming event reminders to send');
      return;
    }

    const results = await Promise.allSettled(
      registrations.map((registration) =>
        this.queueProducer.addEmailJob(
          CONSTANTS.EVENT_JOBS.SEND_EVENT_REMINDER,
          {
            to: registration.user.email,
            context: this.buildReminderContext(registration),
          },
          {
            jobId: `event-reminder:${registration.id}:${this.getKolkataDateKey(now)}`,
          },
        ),
      ),
    );

    let queued = 0;
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        queued += 1;
        return;
      }

      this.logger.error('Failed to queue event reminder', {
        registrationId: registrations[index].id,
        error: JSON.stringify(result.reason),
      });
    });

    this.logger.log(
      `Queued ${queued}/${registrations.length} upcoming event reminder emails`,
    );
  }
}
