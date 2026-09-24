import { IsNotEmpty, IsString } from 'class-validator';

export class CheckoutSessionResDto {
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @IsString()
  @IsNotEmpty()
  checkoutUrl: string;
}
