import { Expose } from 'class-transformer';
import { IsNumber } from 'class-validator';
import { Event } from 'src/modules/events/entities/event.entity';

export class ListEventDto {
  constructor(partial: Partial<ListEventDto>) {
    Object.assign(this, partial);
  }
  @Expose()
  events: Partial<Event>[];

  @Expose()
  @IsNumber()
  total: number;
}
