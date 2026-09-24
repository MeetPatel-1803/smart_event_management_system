import { Inject, Injectable } from '@nestjs/common';
import {
  CreatePaymentDto,
  CreatePaymentResDto,
} from './dto/create-payment.dto';
import { CONSTANTS } from 'src/common/constants/app.constants';
import type { PaymentProvider } from './domain/payment-provider.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Event, EventStatus } from 'src/modules/events/entities/event.entity';
import { Repository } from 'typeorm';
import {
  PaymemtStatus,
  PaymentHistory,
  Provider,
} from './entities/payment.entity';
import { ApiError } from '../response/apiError.service';
import { Messages } from '../messages/messages';
import { Helper } from 'src/common/helper/helper.service';
import {
  UserEvent,
  RegistrationStatus,
} from 'src/modules/events/entities/user-event.entity';
import { QueueProducer } from '../queue/producers/queue.producer';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(PaymentHistory)
    private readonly paymentRepository: Repository<PaymentHistory>,

    @Inject(CONSTANTS.PAYMENT_PROVIDER)
    private readonly paymentProvider: PaymentProvider,

    private readonly queueProducer: QueueProducer,
  ) {}

  async createPayment(body: CreatePaymentDto): Promise<CreatePaymentResDto> {
    const { eventId, amount, currency, userId, registrationId, noOfSeats } =
      body;

    const event = await this.eventRepository.findOne({
      where: { id: eventId },
    });

    if (
      !event ||
      event.status !== EventStatus.PUBLISHED ||
      event.registrationDeadline < new Date()
    ) {
      throw ApiError.notFound(Messages.EVENT_NOT_FOUND);
    }

    const payment = await this.paymentRepository.save({
      eventId,
      userId,
      amount,
      currency,
      provider: Provider.STRIPE,
      status: PaymemtStatus.PENDING,
      expiresAt: Helper.getPaymentWindowExpiration(),
    });

    const session = await this.paymentProvider.createCheckoutSession({
      paymentId: payment.id,
      eventId: payment.eventId,
      amount: payment.amount,
      currency: payment.currency,
      registrationId,
      noOfSeats,
    });

    await this.paymentRepository.update(
      { id: payment.id },
      {
        providerPaymentId: session.sessionId,
        // clientSecret: session.checkoutUrl,
      },
    );

    return {
      sessionId: session.sessionId,
      checkoutUrl: session.checkoutUrl,
    };
  }

  async OnSuccessPayment(
    paymentId: string,
    registrationId: string,
  ): Promise<void> {
    await this.paymentRepository.manager.transaction(
      async (transactionalEntityManager) => {
        if (paymentId) {
          await transactionalEntityManager.update(
            PaymentHistory,
            { id: paymentId },
            { status: PaymemtStatus.COMPLETED },
          );
        }

        if (registrationId) {
          await transactionalEntityManager.update(
            UserEvent,
            { id: registrationId },
            { status: RegistrationStatus.REGISTERED },
          );
        }
      },
    );

    // Add generation of QR code here. Will add in queue.
    await this.queueProducer.addQrCodeJob(
      CONSTANTS.EVENT_JOBS.GENERATE_QR_CODE,
      {
        paymentId,
        registrationId,
      },
    );
  }
  async OnFailedPayment(
    paymentId: string,
    registrationId: string,
    registrationStatus: RegistrationStatus,
  ): Promise<void> {
    await this.paymentRepository.manager.transaction(
      async (transactionalEntityManager) => {
        if (paymentId) {
          await transactionalEntityManager.update(
            PaymentHistory,
            { id: paymentId },
            { status: PaymemtStatus.FAILED },
          );
        }

        if (registrationId) {
          await transactionalEntityManager.update(
            UserEvent,
            { id: registrationId },
            { status: registrationStatus },
          );
        }
      },
    );
  }
}
