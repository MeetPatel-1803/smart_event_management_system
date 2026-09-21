import { Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { BullModule } from '@nestjs/bullmq';
import { Queues } from './queue.index';
import { EventProducer } from './producers/event.producer';
import { getRedisConfig } from 'src/config/redis.config';
import { EventProcessor } from './processors/event.processor';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEvent } from 'src/modules/events/entities/user-event.entity';
import { Event } from 'src/modules/events/entities/event.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEvent, Event]),
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
    BullModule.registerQueue(...Queues),
  ],
  controllers: [],
  providers: [QueueService, EventProducer, EventProcessor],
  exports: [EventProducer, EventProcessor],
})
export class QueueModule {}
