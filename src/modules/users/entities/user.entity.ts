import { CONSTANTS } from 'src/common/constants/app.constants';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Entity, Column } from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity('users')
export class User extends BaseEntity {
  @Column({ name: 'name', length: 100 })
  name: string;

  @Column({ name: 'email', unique: true })
  email: string;

  @Exclude()
  @Column({ name: 'password', length: 60 })
  password: string;

  @Column({
    name: 'role',
    enum: Object.values(CONSTANTS.ROLES),
    default: CONSTANTS.ROLES.USER,
  })
  role: string;

  // Reset-password token
  @Exclude()
  @Column({ name: 'reset_token', type: 'varchar', nullable: true })
  resetToken: string | null;

  @Exclude()
  @Column({ name: 'reset_token_expire', type: 'timestamp', nullable: true })
  resetTokenExpire: Date | null;

  @Exclude()
  @Column({ name: 'refresh_token', type: 'varchar', nullable: true })
  refreshToken: string | null;
}
