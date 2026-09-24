import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegistrationHistoryDto } from './dto/registration-history.dto';
import { Event, EventStatus } from '../events/entities/event.entity';
import { ResponseDto, ResponseMetaDTO } from 'src/common/dto/response.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ListEventDto } from './dto/list-event.dto';
import { ApiError } from 'src/shared/response/apiError.service';
import { Messages } from 'src/shared/messages/messages';
import { RegisterEventDto } from './dto/register-event.dto';
import {
  RegistrationStatus,
  UserEvent,
} from '../events/entities/user-event.entity';
import { User } from './entities/user.entity';
import {
  RegisterEventResDto,
  WaitlistedUserResDto,
} from './dto/register-event-response.dto';
import { CancelRegistrationDto } from './dto/cancel-registration.dto';
import { CancelRegistrationResDto } from './dto/cancel-registration-response.dto';
import { QueueProducer } from 'src/shared/queue/producers/queue.producer';
import { CONSTANTS } from 'src/common/constants/app.constants';
import { PaymentService } from 'src/shared/payment/payment.service';
import { Helper } from 'src/common/helper/helper.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,

    @InjectRepository(UserEvent)
    private readonly userEventRepository: Repository<UserEvent>,

    private readonly queueProducer: QueueProducer,
    private readonly paymentService: PaymentService,
  ) {}

  async listEvents(
    query: PaginationDto,
  ): Promise<ResponseDto<ListEventDto, ResponseMetaDTO>> {
    const { limit, page } = query;
    const skip = (page! - 1) * limit!;

    const [events, total] = await this.eventRepository.findAndCount({
      where: { status: EventStatus.PUBLISHED },
      skip,
      take: limit,
    });

    return new ResponseDto({
      data: new ListEventDto({ events }),
      meta: new ResponseMetaDTO({
        total,
        limit,
        page,
        pageCount: Math.ceil(total / limit!),
      }),
    });
  }

  async registerForEvent(
    eventId: string,
    body: RegisterEventDto,
    user: User,
  ): Promise<RegisterEventResDto | WaitlistedUserResDto> {
    const { noOfSeats } = body;
    const event = await this.eventRepository.findOneBy({ id: eventId });

    if (
      !event ||
      event.status !== EventStatus.PUBLISHED ||
      event.registrationDeadline < new Date()
    ) {
      throw ApiError.notFound(Messages.EVENT_NOT_FOUND);
    }

    const existingUserEvent = await this.userEventRepository.findOne({
      where: { eventId, userId: user.id },
    });

    if (existingUserEvent) {
      if (existingUserEvent.status === RegistrationStatus.REGISTERED) {
        throw ApiError.conflict(Messages.ALREADY_REGISTERED);
      }
      if (existingUserEvent.status === RegistrationStatus.WAITLISTED) {
        throw ApiError.conflict(Messages.ALREADY_WAITLISTED);
      }
      if (
        existingUserEvent.status === RegistrationStatus.PAYMENT_PENDING &&
        existingUserEvent.expiresAt &&
        existingUserEvent.expiresAt > new Date()
      ) {
        throw ApiError.conflict(Messages.PAYMENT_PENDING);
      }
    }

    const seatsResult = (await this.userEventRepository
      .createQueryBuilder('userEvent')
      .select('SUM(userEvent.noOfSeatsRequired)', 'totalSeatsOccupied')
      .where('userEvent.eventId = :eventId', { eventId })
      .andWhere('userEvent.status IN (:...statuses)', {
        statuses: [
          RegistrationStatus.REGISTERED,
          RegistrationStatus.PAYMENT_PENDING,
        ],
      })
      .getRawOne()) as { totalSeatsOccupied: number | null };

    const totalSeatsOccupied = seatsResult?.totalSeatsOccupied || 0;
    const availableSeats = event.capacity - totalSeatsOccupied;

    if (availableSeats < noOfSeats) {
      // Note: As per the standard approach, store users in the DB instead of a queue,
      // and remove them if they don’t get a chance before the event starts.

      const waitListedUser = this.userEventRepository.create({
        eventId: eventId,
        userId: user.id,
        status: RegistrationStatus.WAITLISTED,
        noOfSeatsRequired: noOfSeats,
      });

      await this.userEventRepository.save(waitListedUser);

      return new WaitlistedUserResDto({ waitListedUser });
    }

    // here checkout for payment
    const registration = await this.userEventRepository.save({
      eventId,
      userId: user.id,
      status: RegistrationStatus.PAYMENT_PENDING,
      expiresAt: Helper.getPaymentWindowExpiration(),
      noOfSeatsRequired: noOfSeats,
    });

    const paymentResult = await this.paymentService.createPayment({
      eventId,
      userId: user.id,
      amount: event.price,
      currency: CONSTANTS.STRIPE_CURRENCY.INR,
      registrationId: registration.id,
      noOfSeats,
    });

    return new RegisterEventResDto({ registration, ...paymentResult });
  }

  async cancelRegistration(
    registrationId: string,
    body: CancelRegistrationDto,
    user: User,
  ): Promise<CancelRegistrationResDto> {
    const { cancelSeats } = body;

    const registration = await this.userEventRepository.findOne({
      where: {
        id: registrationId,
        userId: user.id,
        status: RegistrationStatus.REGISTERED,
      },
    });

    if (!registration) {
      throw ApiError.notFound(Messages.REGISTRATION_NOT_FOUND);
    }

    if (cancelSeats > registration.noOfSeatsRequired) {
      throw ApiError.badRequest(Messages.CANNOT_CANCEL_MORE_SEATS);
    }
    if (cancelSeats === registration.noOfSeatsRequired) {
      registration.status = RegistrationStatus.CANCELLED;
      // We set the status to cancelled but keep the original seats for record/history if desired,
      // or we can set it to 0. We'll set it to 0 to free up capacity calculations correctly.
      registration.noOfSeatsRequired = 0;
    } else {
      registration.noOfSeatsRequired -= cancelSeats;
    }

    await this.userEventRepository.save(registration);

    // Will add the current event into queue for seat allotment to the next waiting user.
    await this.queueProducer.addEventWaitingListJob(
      CONSTANTS.EVENT_JOBS.PROCESS_NEXT_WAITING_USER,
      registration.eventId,
    );

    return new CancelRegistrationResDto({
      cancelledRegistration: registration,
    });
  }

  async listRegistrationHistory(
    user: User,
    query: PaginationDto,
  ): Promise<ResponseDto<RegistrationHistoryDto, ResponseMetaDTO>> {
    const { limit, page } = query;
    const skip = (page! - 1) * limit!;

    const [registrations, total] = await this.userEventRepository.findAndCount({
      where: { userId: user.id },
      relations: {
        event: true,
      },
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return new ResponseDto({
      data: new RegistrationHistoryDto({ registrations }),
      meta: new ResponseMetaDTO({
        total,
        limit,
        page,
        pageCount: Math.ceil(total / limit!),
      }),
    });
  }
}
