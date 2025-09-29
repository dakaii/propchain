import { Entity, Property, ManyToOne, Index, PrimaryKey } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { User } from './user.entity';
import { Property as PropertyEntity } from './property.entity';

@Entity()
@Index({ properties: ['user', 'property'] })
export class Position {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  @ManyToOne(() => User)
  user!: User;

  @ManyToOne(() => PropertyEntity)
  property!: PropertyEntity;

  @Property({ type: 'integer' })
  shares!: number;

  @Property({ type: 'decimal', precision: 20, scale: 6 })
  averagePrice!: number;

  @Property({ type: 'decimal', precision: 20, scale: 2 })
  totalInvested!: number;

  @Property({ type: 'decimal', precision: 20, scale: 2 })
  currentValue!: number;

  @Property({ type: 'decimal', precision: 20, scale: 2 })
  realizedGains: number = 0;

  @Property({ type: 'decimal', precision: 20, scale: 2 })
  unrealizedGains: number = 0;

  @Property({ type: 'decimal', precision: 20, scale: 2 })
  totalDistributions: number = 0;

  @Property({ nullable: true })
  lastDistributionAt?: Date;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @Property({ type: 'json', nullable: true })
  transactionHistory?: Array<{
    type: 'buy' | 'sell';
    shares: number;
    price: number;
    timestamp: Date;
    txHash?: string;
  }>;
}