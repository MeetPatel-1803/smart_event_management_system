import { BaseEntity } from 'src/common/entities/base.entity';
import { Entity, Column, Index } from 'typeorm';

export enum EventStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  DELETED = 'DELETED',
}

export enum EventCategories {
  CONCERT = 'CONCERT',
  CONFERENCE = 'CONFERENCE',
  BUSINESS = 'BUSINESS',
  WORKSHOP = 'WORKSHOP',
  SPORTS = 'SPORTS',
  FOOD_AND_DRINK = 'FOOD_AND_DRINK',
  ARTS_AND_CULTURE = 'ARTS_AND_CULTURE',
  COMEDY = 'COMEDY',
  FESTIVAL = 'FESTIVAL',
  EXHIBITION = 'EXHIBITION',
  CAREER = 'CAREER',
  EDUCATION = 'EDUCATION',
  HEALTH_AND_WELLNESS = 'HEALTH_AND_WELLNESS',
  TRAVEL_AND_ADVENTURE = 'TRAVEL_AND_ADVENTURE',
  KIDS_AND_FAMILY = 'KIDS_AND_FAMILY',
  COMMUNITY = 'COMMUNITY',
  CHARITY = 'CHARITY',
  WEDDING = 'WEDDING',
  PARTY = 'PARTY',
  RELIGIOUS_AND_SPIRITUAL = 'RELIGIOUS_AND_SPIRITUAL',
}

@Entity('events')
@Index(['startTime', 'endTime'])
export class Event extends BaseEntity {
  @Column({ name: 'name', length: 50, type: 'varchar' })
  @Index({ unique: true })
  name: string;

  @Column({ name: 'description', length: 200, type: 'varchar', nullable: true })
  description: string | null;

  @Column({ name: 'price', type: 'float' })
  @Index()
  price: number;

  @Column({ name: 'start_time', type: 'timestamp' })
  @Index()
  startTime: Date;

  @Column({ name: 'end_time', type: 'timestamp' })
  @Index()
  endTime: Date;

  @Column({ name: 'location', length: 200, type: 'varchar' })
  location: string;

  @Column({ name: 'capacity', type: 'int' })
  @Index()
  capacity: number;

  @Column({
    name: 'status',
    enum: EventStatus,
    default: EventStatus.DRAFT,
    type: 'enum',
  })
  @Index()
  status: EventStatus;

  @Column({ name: 'banner_image', type: 'varchar', nullable: true })
  bannerImage: string | null;

  @Column({
    name: 'category',
    enum: EventCategories,
    default: EventCategories.CONCERT,
    type: 'enum',
  })
  @Index()
  category: EventCategories;

  // @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  // @JoinColumn({
  //   name: 'organiser',
  // })
  // @Index()
  // organiser: User;

  @Column({ name: 'organiser_id' })
  @Index()
  organiser_id: string;

  @Column({ name: 'registration_deadline', type: 'timestamp' })
  @Index()
  registrationDeadline: Date;
}
