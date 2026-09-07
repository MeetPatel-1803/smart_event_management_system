import { Module } from '@nestjs/common';
import { JwtServices } from './strategies/jwt.strategies';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ResponseService } from 'src/shared/response/apiResponse.service';
import { EmailModule } from '../email/email.module';
import { AuthUserGuard } from 'src/common/guards/auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secret: process.env.JWT_SECRET!,
    }),
    EmailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, ResponseService, JwtServices, AuthUserGuard],
  exports: [JwtServices, AuthUserGuard],
})
export class AuthModule {}
