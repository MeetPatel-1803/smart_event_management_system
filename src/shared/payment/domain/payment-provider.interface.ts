// Payment provider abstraction.

import { CheckoutSessionResDto } from '../providers/stripe/dto/checkout-session-res.dto';
import { CheckoutSessionDto } from '../providers/stripe/dto/chekout-session.dto';
import { StripeCreatePaymentResDto } from '../providers/stripe/dto/stripe-create-payment-res.dto';
import { StripeCreatePaymentDto } from '../providers/stripe/dto/stripe-create-payment.dto';

export interface PaymentProvider {
  createPayment(
    input: StripeCreatePaymentDto,
  ): Promise<StripeCreatePaymentResDto>;

  createCheckoutSession(
    input: CheckoutSessionDto,
  ): Promise<CheckoutSessionResDto>;
}
