import { Entity, Property, Enum, ManyToOne, PrimaryKey } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { User } from './user.entity';
import { Property as PropertyEntity } from './property.entity';

export enum OrderType {
  BUY = 'buy',
  SELL = 'sell',
}

export enum OrderStatus {
  PENDING = 'pending',
  MATCHED = 'matched',
  PARTIALLY_FILLED = 'partially_filled',
  FILLED = 'filled',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  SETTLING = 'settling',
  SETTLED = 'settled',
}

@Entity()
export class Order {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  @ManyToOne(() => User)
  user!: User;

  @ManyToOne(() => PropertyEntity)
  property!: PropertyEntity;

  @Enum(() => OrderType)
  type!: OrderType;

  @Enum(() => OrderStatus)
  status: OrderStatus = OrderStatus.PENDING;

  @Property({ type: 'integer' })
  quantity!: number;

  @Property({ type: 'integer' })
  filledQuantity: number = 0;

  @Property({ type: 'decimal', precision: 20, scale: 6 })
  price!: number;

  @Property({ type: 'decimal', precision: 20, scale: 2 })
  totalAmount!: number;

  @Property({ nullable: true })
  yellowChannelId?: string;

  @Property({ nullable: true })
  yellowTransactionId?: string;

  @Property({ nullable: true })
  matchedWithOrderId?: string;

  @Property({ nullable: true })
  txHash?: string;

  @Property({ nullable: true })
  expiresAt?: Date;

  @Property({ nullable: true })
  matchedAt?: Date;

  @Property({ nullable: true })
  settledAt?: Date;

  @Property({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}