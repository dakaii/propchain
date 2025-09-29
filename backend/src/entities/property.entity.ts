import { Entity, Property as Prop, OneToMany, Collection, Embeddable, Embedded, PrimaryKey } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { Order } from './order.entity';
import { Position } from './position.entity';
import { Distribution } from './distribution.entity';

export const PropertyStatus = {
  PENDING: 'pending',
  ACTIVE: 'active',
  FULLY_FUNDED: 'fully_funded',
  SOLD: 'sold',
  INACTIVE: 'inactive',
} as const;

export type PropertyStatus = typeof PropertyStatus[keyof typeof PropertyStatus];

export const PropertyType = {
  RESIDENTIAL: 'residential',
  COMMERCIAL: 'commercial',
  INDUSTRIAL: 'industrial',
  RETAIL: 'retail',
  MIXED_USE: 'mixed_use',
} as const;

export type PropertyType = typeof PropertyType[keyof typeof PropertyType];

@Embeddable()
export class PropertyAddress {
  @Prop()
  street!: string;

  @Prop()
  city!: string;

  @Prop()
  state!: string;

  @Prop()
  zipCode!: string;

  @Prop()
  country!: string;
}

@Embeddable()
export class PropertyMetrics {
  @Prop({ type: 'decimal', precision: 20, scale: 2 })
  monthlyRent!: number;

  @Prop({ type: 'decimal', precision: 5, scale: 2 })
  annualYield!: number;

  @Prop({ type: 'decimal', precision: 5, scale: 2 })
  occupancyRate!: number;

  @Prop({ type: 'integer' })
  squareFootage!: number;

  @Prop({ type: 'integer' })
  yearBuilt!: number;

  @Prop({ type: 'integer' })
  bedrooms?: number;

  @Prop({ type: 'integer' })
  bathrooms?: number;
}

@Entity()
export class Property {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  @Prop()
  name!: string;

  @Prop({ type: 'text' })
  description!: string;

  @Embedded(() => PropertyAddress)
  address!: PropertyAddress;

  @Prop()
  type!: PropertyType;

  @Prop()
  status: PropertyStatus = PropertyStatus.PENDING;

  @Prop({ type: 'decimal', precision: 20, scale: 2 })
  totalValue!: number;

  @Prop({ type: 'integer' })
  totalShares!: number;

  @Prop({ type: 'decimal', precision: 20, scale: 6 })
  pricePerShare!: number;

  @Prop({ type: 'integer' })
  availableShares!: number;

  @Prop({ type: 'decimal', precision: 20, scale: 2 })
  minimumInvestment: number = 50;

  @Prop()
  contractAddress!: string;

  @Prop({ nullable: true })
  tokenSymbol?: string;

  @Embedded(() => PropertyMetrics)
  metrics!: PropertyMetrics;

  @Prop({ type: 'json', nullable: true })
  images?: string[];

  @Prop({ type: 'json', nullable: true })
  documents?: Record<string, string>;

  @Prop({ nullable: true })
  fundingDeadline?: Date;

  @Prop({ nullable: true })
  fundingCompletedAt?: Date;

  @OneToMany(() => Order, (order) => order.property)
  orders = new Collection<Order>(this);

  @OneToMany(() => Position, (position) => position.property)
  positions = new Collection<Position>(this);

  @OneToMany(() => Distribution, (distribution) => distribution.property)
  distributions = new Collection<Distribution>(this);

  @Prop()
  createdAt: Date = new Date();

  @Prop({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}