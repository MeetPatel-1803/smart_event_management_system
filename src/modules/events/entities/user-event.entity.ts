import { BaseEntity } from 'src/common/entities/base.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { Event } from './event.entity';

enum RegistrationStatus {
  REGISTERED = 'REGISTERED',
  CANCELLED = 'CANCELLED',
}

@Entity('user_events')
@Index(['user', 'event'], { unique: true }) // This will prevent from duplicate registrations
export class UserEvent extends BaseEntity {
  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  @Index()
  user: User;

  @ManyToOne(() => Event, (event) => event.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  @Index()
  event: Event;

  @Column({ type: 'enum', enum: RegistrationStatus, nullable: true })
  status: RegistrationStatus;
}
