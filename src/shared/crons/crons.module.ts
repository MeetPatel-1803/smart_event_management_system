import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from 'src/modules/events/entities/event.entity';
import { UserEvent } from 'src/modules/events/entities/user-event.entity';
import { CronServices } from './cron.service';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserEvent, Event]), QueueModule],
  providers: [CronServices],
})
export class CronsModule {}
