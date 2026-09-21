import { Expose } from 'class-transformer';
import { UserEvent } from 'src/modules/events/entities/user-event.entity';

export class CancelRegistrationResDto {
  constructor(partial: Partial<CancelRegistrationResDto>) {
    Object.assign(this, partial);
  }

  @Expose()
  cancelledRegistration: UserEvent;
}
