import { Expose } from 'class-transformer';
import { UserEvent } from 'src/modules/events/entities/user-event.entity';

export class RegisterEventResDto {
  constructor(partial: Partial<RegisterEventResDto>) {
    Object.assign(this, partial);
  }

  @Expose()
  registeredUser: UserEvent;
}

export class WaitlistedUserResDto {
  constructor(partial: Partial<WaitlistedUserResDto>) {
    Object.assign(this, partial);
  }

  @Expose()
  waitListedUser: UserEvent;
}
