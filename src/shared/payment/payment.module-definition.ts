// Dynamic module configuration

import { ConfigurableModuleBuilder } from '@nestjs/common';
import { PaymentModuleOptions } from './domain/payment.types';

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<PaymentModuleOptions>()
    .setClassMethodName('forRoot')
    .build();
