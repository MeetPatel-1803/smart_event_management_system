import { IsNotEmpty, IsString } from 'class-validator';

export class StripeCreatePaymentResDto {
  @IsNotEmpty()
  @IsString()
  providerPaymentId: string;

  @IsNotEmpty()
  @IsString()
  clientSecret: string;
}
