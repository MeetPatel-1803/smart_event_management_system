import { BaseEntity } from 'src/common/entities/base.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { Event } from './event.entity';

export enum RegistrationStatus {
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  WAITLISTED = 'WAITLISTED',
  REGISTERED = 'REGISTERED',
  PAYMENT_PENDING = 'PAYMENT_PENDING',
}

@Entity('user_events')
@Index(['userId', 'eventId'], { unique: true })
export class UserEvent extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'event_id', type: 'uuid' })
  eventId: string;

  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Event, (event) => event.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @Column({ type: 'enum', enum: RegistrationStatus, nullable: true })
  status: RegistrationStatus;

  // @Column({ type: 'int', array: true })
  // reservedSeats: number[];

  @Column({ type: 'int' })
  noOfSeatsRequired: number;

  // Payment window expiresAt
  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date | null;
}
