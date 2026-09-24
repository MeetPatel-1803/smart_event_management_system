import { PaymentModuleOptions } from '../domain/payment.types';
import { Provider } from '../entities/payment.entity';

export const getPaymentProvidersConfig = (): PaymentModuleOptions => ({
  [Provider.STRIPE]: {
    secretKey: process.env.STRIPE_SECRET_KEY!,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
  },
});
