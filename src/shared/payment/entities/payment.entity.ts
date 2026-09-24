import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity } from 'typeorm';

export enum PaymemtStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum Provider {
  STRIPE = 'STRIPE',
  RAZORPAY = 'RAZORPAY',
}

@Entity('payment_history')
export class PaymentHistory extends BaseEntity {
  @Column({ name: 'event_id', type: 'uuid' })
  eventId: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'amount', type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  //Note: We can define enum type and take only required currency types
  @Column({ name: 'currency', type: 'varchar', length: 3 })
  currency: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: PaymemtStatus,
  })
  status: PaymemtStatus;

  @Column({
    name: 'provider',
    type: 'enum',
    enum: Provider,
  })
  provider: Provider;

  @Column({ name: 'provider_payment_id', type: 'varchar', nullable: true })
  providerPaymentId: string | null;

  @Column({ name: 'client_secret', type: 'varchar', nullable: true })
  clientSecret: string | null;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date | null;

  //   @Column({
  //     name: 'payment_method',
  //     type: 'varchar',
  //   })
  //   paymentMethod: string;
}
