import { Expose } from 'class-transformer';
import { UserEvent } from 'src/modules/events/entities/user-event.entity';

export class RegistrationHistoryDto {
  constructor(partial: Partial<RegistrationHistoryDto>) {
    Object.assign(this, partial);
  }
  @Expose()
  registrations: Partial<UserEvent>[];
}
