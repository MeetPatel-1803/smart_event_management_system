// Stripe webhook logic
import { Controller, Headers, Post, Req } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { StripeProvider } from './providers/stripe/stripe.provider';
import { CONSTANTS } from 'src/common/constants/app.constants';
import { PaymentService } from './payment.service';
import Stripe from 'stripe';
import { RegistrationStatus } from 'src/modules/events/entities/user-event.entity';

@Controller('webhook')
export class PaymentWebhookController {
  constructor(
    private readonly stripeProvider: StripeProvider,
    private readonly paymentService: PaymentService,
  ) {}

  @Post('/stripe')
  async handleStripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature')
    signature: string,
  ) {
    const event = this.stripeProvider.constructWebhookEvent(
      req.rawBody!,
      signature,
    );

    switch (event.type) {
      case CONSTANTS.STRIPE_EVENTS.CHECKOUT_SESSION_COMPLETED: {
        const session = event.data.object as Stripe.Checkout.Session;
        const paymentId = session.metadata?.paymentId;
        const registrationId = session.metadata?.registrationId;

        if (paymentId || registrationId) {
          await this.paymentService.OnSuccessPayment(
            paymentId!,
            registrationId!,
          );
        }
        break;
      }

      case CONSTANTS.STRIPE_EVENTS.CHECKOUT_SESSION_EXPIRED: {
        const session = event.data.object as Stripe.Checkout.Session;
        const paymentId = session.metadata?.paymentId;
        const registrationId = session.metadata?.registrationId;

        if (paymentId || registrationId) {
          await this.paymentService.OnFailedPayment(
            paymentId!,
            registrationId!,
            RegistrationStatus.FAILED,
          );
        }
        break;
      }

      default:
        break;
    }

    return {
      received: true,
    };
  }
}
