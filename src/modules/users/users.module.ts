import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from '../events/entities/event.entity';
import { AuthModule } from '../auth/auth.module';
import { User } from './entities/user.entity';
import { ResponseService } from 'src/shared/response/apiResponse.service';
import { UserEvent } from '../events/entities/user-event.entity';
import { QueueModule } from 'src/shared/queue/queue.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event, User, UserEvent]),
    AuthModule,
    QueueModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, ResponseService],
})
export class UsersModule {}
