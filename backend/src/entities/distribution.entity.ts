import { Entity, Property, ManyToOne, PrimaryKey } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { Property as PropertyEntity } from './property.entity';

export const DistributionType = {
  RENTAL_INCOME: 'rental_income',
  SALE_PROCEEDS: 'sale_proceeds',
  DIVIDEND: 'dividend',
  OTHER: 'other',
} as const;

export type DistributionType = typeof DistributionType[keyof typeof DistributionType];

export const DistributionStatus = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export type DistributionStatus = typeof DistributionStatus[keyof typeof DistributionStatus];

@Entity()
export class Distribution {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  @ManyToOne(() => PropertyEntity)
  property!: PropertyEntity;

  @Property({ type: 'decimal', precision: 20, scale: 2 })
  totalAmount!: number;

  @Property({ type: 'decimal', precision: 20, scale: 6 })
  perShareAmount!: number;

  @Property({ type: 'integer' })
  eligibleShares!: number;

  @Property({ type: 'text', nullable: true })
  description?: string;

  @Property({ nullable: true })
  recordDate?: Date;

  @Property({ nullable: true })
  paymentDate?: Date;

  @Property({ nullable: true })
  txHash?: string;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}