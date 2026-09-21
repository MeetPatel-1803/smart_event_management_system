import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from './config/database.config';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module';
import { EmailModule } from './modules/email/email.module';
import { EventsModule } from './modules/events/events.module';
import { CloudinaryModule } from './shared/cloudinary/cloudinary.module';
import { QueueModule } from './shared/queue/queue.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CronsModule } from './shared/crons/crons.module';
import { SeedersModule } from './database/seeders/seeders.module';
import { createObserveModule } from '@nestjs/observe';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({ useFactory: getDatabaseConfig }),
    ScheduleModule.forRoot(),
    ...(process.env.NODE_ENV === 'production'
      ? [
          ObserveModule.forRoot({
            appKey: process.env.OBSERVE_APP_KEY!,
            appSecret: process.env.OBSERVE_APP_SECRET!,
            serviceId: 'sems', // sems - smart event management system
          }),
        ]
      : []),

    UsersModule,
    AuthModule,
    EmailModule,
    EventsModule,
    CloudinaryModule,
    QueueModule,
    CronsModule,
    SeedersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
