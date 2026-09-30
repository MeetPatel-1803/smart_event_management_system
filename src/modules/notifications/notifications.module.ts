import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { AuthModule } from 'src/modules/auth/auth.module';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationsService } from './notifications.service';

// Global: almost every module (users, events, payment, queue processors)
// needs to fire notifications, so it's registered once instead of re-imported.
@Global()
@Module({
  imports: [TypeOrmModule.forFeature([User]), AuthModule],
  providers: [NotificationsGateway, NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
