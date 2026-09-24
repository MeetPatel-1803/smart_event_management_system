import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { StripeCreatePaymentDto } from './stripe-create-payment.dto';

export class CheckoutSessionDto extends StripeCreatePaymentDto {
  @IsNotEmpty()
  @IsString()
  registrationId: string;

  @IsNotEmpty()
  @IsNumber()
  noOfSeats: number;
}
