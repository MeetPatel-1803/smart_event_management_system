import { Provider } from '../entities/payment.entity';

export interface PaymentModuleOptions {
  [Provider.STRIPE]: {
    secretKey: string;
    webhookSecret: string;
  };
}
