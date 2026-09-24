import { Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { BullModule } from '@nestjs/bullmq';
import { Queues } from './queue.index';
import { QueueProducer } from './producers/queue.producer';
import { getRedisConfig } from 'src/config/redis.config';
import { EventProcessor } from './processors/event.processor';
import { QrProcessor } from './processors/qr.processor';
import { EmailProcessor } from './processors/email.processor';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEvent } from 'src/modules/events/entities/user-event.entity';
import { Event } from 'src/modules/events/entities/event.entity';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { EmailModule } from 'src/modules/email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEvent, Event]),
    EmailModule,
    BullModule.forRootAsync({
      useFactory: () => ({
        connection: getRedisConfig(),
        // Imp: Here, we can set default job options:

        // defaultJobOptions: Options to control the default settings for new jobs.
        defaultJobOptions: {
          attempts: 3,

          backoff: { type: 'fixed', delay: 3000 },

          removeOnComplete: true,
        },

        // prefix: default prefix for all queues
        // prefix: 'event-management',

        // settings: Advanced Queue configuration settings.
      }),
    }),
    BullBoardModule.forRoot({
      route: '/admin/queues',
      adapter: ExpressAdapter,
    }),
    BullModule.registerQueue(...Queues),
    BullBoardModule.forFeature(
      ...Queues.map((queue) => ({
        name: queue.name,
        adapter: BullMQAdapter,
      })),
    ),
  ],
  controllers: [],
  providers: [
    QueueService,
    QueueProducer,
    EventProcessor,
    QrProcessor,
    EmailProcessor,
  ],
  exports: [QueueProducer, EventProcessor, QrProcessor, EmailProcessor],
})
export class QueueModule {}
