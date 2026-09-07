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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({ useFactory: getDatabaseConfig }),

    UsersModule,
    AuthModule,
    EmailModule,
    EventsModule,
    CloudinaryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
