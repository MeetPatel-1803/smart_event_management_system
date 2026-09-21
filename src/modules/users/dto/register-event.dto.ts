import { IsNotEmpty, IsNumber, IsPositive, Max } from 'class-validator';

export class RegisterEventDto {
  @IsNotEmpty({ message: 'Number of seats is required' })
  @IsNumber({}, { message: 'Number of seats must be a number' })
  @IsPositive({ message: 'Number of seats must be greater than 0' })
  @Max(5)
  noOfSeats: number;

  // @IsArray()
  // @IsNumber({}, { each: true })
  // seats?: number[];
}
