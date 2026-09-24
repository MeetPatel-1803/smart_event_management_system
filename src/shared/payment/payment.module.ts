import { Global, Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { PaymentHistory } from './entities/payment.entity';
import { Event } from 'src/modules/events/entities/event.entity';
import { StripeProvider } from './providers/stripe/stripe.provider';
import { PaymentWebhookController } from './payment.webhook.controller';
import { ConfigurableModuleClass } from './payment.module-definition';
import { CONSTANTS } from 'src/common/constants/app.constants';
import { AuthModule } from 'src/modules/auth/auth.module';
import { ResponseService } from '../response/apiResponse.service';
import { QueueModule } from '../queue/queue.module';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([User, Event, PaymentHistory]),
    AuthModule,
    QueueModule,
  ],
  controllers: [PaymentController, PaymentWebhookController],
  providers: [
    PaymentService,
    StripeProvider,
    ResponseService,
    {
      provide: CONSTANTS.PAYMENT_PROVIDER,
      useExisting: StripeProvider,
    },
  ],
  exports: [PaymentService],
})
export class PaymentModule extends ConfigurableModuleClass {}
