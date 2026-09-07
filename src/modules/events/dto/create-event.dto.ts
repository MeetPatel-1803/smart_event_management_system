import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  IsOptional,
} from 'class-validator';
import { EventCategories } from '../entities/event.entity';
import { Type } from 'class-transformer';

export class CreateEventDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name: string;

  @IsString()
  @MaxLength(200)
  description: string;

  @Type(() => Number) // Force transformation from string to Number
  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsNotEmpty()
  @IsDateString()
  startTime: string;

  @IsNotEmpty()
  @IsDateString()
  endTime: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  location: string;

  @Type(() => Number) // Force transformation from string to Number
  @IsNotEmpty()
  @IsNumber()
  capacity: number;

  //   @IsNotEmpty()
  //   @IsEnum(EventStatus)
  //   status: EventStatus;

  @IsOptional()
  bannerImage?: string;

  @IsNotEmpty()
  @IsEnum(EventCategories)
  category: EventCategories;

  @IsNotEmpty()
  @IsDateString()
  registrationDeadline: string;
}
