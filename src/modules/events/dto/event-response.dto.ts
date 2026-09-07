import { Expose } from 'class-transformer';
import { Event } from '../entities/event.entity';

export class EventResponseDto {
  constructor(partial: Partial<EventResponseDto>) {
    Object.assign(this, partial);
  }

  @Expose()
  event: Event;
}

export class FindAllEventResponseDto {
  constructor(partial: Partial<FindAllEventResponseDto>) {
    Object.assign(this, partial);
  }

  @Expose()
  events: Partial<Event>[];
}
