import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { ResponseService } from 'src/shared/response/apiResponse.service';
import { User } from '../users/entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { CloudinaryService } from 'src/shared/cloudinary/cloudinary.service';

@Module({
  imports: [TypeOrmModule.forFeature([Event, User]), AuthModule],
  controllers: [EventsController],
  providers: [CloudinaryService, EventsService, ResponseService],
})
export class EventsModule {}
