import { Type } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { Provider } from '../entities/payment.entity';

export class CreatePaymentDto {
  @IsNotEmpty()
  @IsString()
  eventId: string;

  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @Type(() => Number)
  amount: number;

  @IsNotEmpty()
  @IsString()
  currency: string;

  @IsNotEmpty()
  @IsString()
  registrationId: string;

  @IsNotEmpty()
  @Type(() => Number)
  noOfSeats: number;

  // @IsNotEmpty()
  // @IsString()
  // provider: Provider;
}

export class CreatePaymentResDto {
  @IsNotEmpty()
  @IsString()
  sessionId: string;

  @IsNotEmpty()
  @IsString()
  checkoutUrl: string;
}
