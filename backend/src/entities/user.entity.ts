import { Entity, Property, OneToMany, Collection, Index, PrimaryKey } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { Order } from './order.entity';
import { Position } from './position.entity';

export const KYCStatus = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
} as const;

export type KYCStatus = typeof KYCStatus[keyof typeof KYCStatus];

export const UserRole = {
  INVESTOR: 'investor',
  ADMIN: 'admin',
  OPERATOR: 'operator',
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

@Entity()
@Index({ properties: ['email'] })
@Index({ properties: ['walletAddress'] })
export class User {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  @Property({ unique: true })
  email!: string;

  @Property({ unique: true })
  walletAddress!: string;

  @Property({ nullable: true })
  firstName?: string;

  @Property({ nullable: true })
  lastName?: string;

  @Property({ hidden: true })
  passwordHash!: string;

  @Property()
  kycStatus: KYCStatus = KYCStatus.PENDING;

  @Property()
  role: UserRole = UserRole.INVESTOR;

  @Property({ type: 'boolean' })
  isActive: boolean = true;

  @Property({ type: 'boolean' })
  emailVerified: boolean = false;

  @Property({ nullable: true })
  yellowChannelId?: string;

  @Property({ type: 'decimal', precision: 20, scale: 2 })
  totalInvested: number = 0;

  @Property({ type: 'decimal', precision: 20, scale: 2 })
  totalReturns: number = 0;

  @OneToMany(() => Order, (order) => order.user)
  orders = new Collection<Order>(this);

  @OneToMany(() => Position, (position) => position.user)
  positions = new Collection<Position>(this);

  @Property({ nullable: true })
  lastLoginAt?: Date;

  @Property({ nullable: true })
  kycVerifiedAt?: Date;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}