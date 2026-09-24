// Stripe-specific implementation

import { Inject, Injectable } from '@nestjs/common';
import { Provider } from '../../entities/payment.entity';
import Stripe from 'stripe';
import type { PaymentModuleOptions } from '../../domain/payment.types';
import { PaymentProvider } from '../../domain/payment-provider.interface';
import { StripeCreatePaymentDto } from './dto/stripe-create-payment.dto';
import { MODULE_OPTIONS_TOKEN } from '../../payment.module-definition';
import { Messages } from 'src/shared/messages/messages';
import { CheckoutSessionDto } from './dto/chekout-session.dto';
import { CheckoutSessionResDto } from './dto/checkout-session-res.dto';
import { Helper } from 'src/common/helper/helper.service';

@Injectable()
export class StripeProvider implements PaymentProvider {
  private readonly stripe: Stripe;

  constructor(
    @Inject(MODULE_OPTIONS_TOKEN)
    private readonly options: PaymentModuleOptions,
  ) {
    this.stripe = new Stripe(this.options[Provider.STRIPE].secretKey);
  }

  async createPayment(input: StripeCreatePaymentDto) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: input.amount,
        currency: input.currency,

        metadata: {
          paymentId: input.paymentId,
          eventId: input.eventId,
        },
      });

      if (!paymentIntent.client_secret) {
        throw new Error(Messages.CLIENT_SECRET_NOT_RETURNED);
      }

      return {
        providerPaymentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
      };
    } catch (error) {
      console.error('Error creating Stripe payment:', error);
      throw new Error('Failed to create Stripe payment');
    }
  }

  async createCheckoutSession(
    input: CheckoutSessionDto,
  ): Promise<CheckoutSessionResDto> {
    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',

      line_items: [
        {
          price_data: {
            currency: input.currency,
            product_data: {
              name: 'Event Registration',
            },
            unit_amount: Helper.getFormatedAmount(input.amount),
          },
          quantity: input.noOfSeats,
        },
      ],

      metadata: {
        paymentId: input.paymentId,
        eventId: input.eventId,
        registrationId: input.registrationId,
      },

      success_url: `${process.env.FRONTEND_URL}/payment/success`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
    });

    return {
      sessionId: session.id,
      checkoutUrl: session.url!,
    };
  }

  constructWebhookEvent(payload: string | Buffer, signature: string) {
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      this.options[Provider.STRIPE].webhookSecret,
    );
  }
}
