import { Type } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class StripeCreatePaymentDto {
  @IsNotEmpty()
  @IsString()
  eventId: string;

  @IsNotEmpty()
  @Type(() => Number)
  amount: number;

  @IsNotEmpty()
  @IsString()
  currency: string;

  @IsNotEmpty()
  @IsString()
  paymentId: string;
}
