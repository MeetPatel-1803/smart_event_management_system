import { Type } from 'class-transformer';
import { IsNumber, IsOptional, Min } from 'class-validator';
import { CONSTANTS } from '../constants/app.constants';

export class PaginationDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = CONSTANTS.PAGE;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  limit?: number = CONSTANTS.LIMIT;
}
