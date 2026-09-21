import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class CancelRegistrationDto {
  @IsNotEmpty({ message: 'Number of seats to cancel is required' })
  @IsNumber({}, { message: 'Number of seats to cancel must be a number' })
  @IsPositive({ message: 'Number of seats to cancel must be greater than 0' })
  cancelSeats: number;
}
