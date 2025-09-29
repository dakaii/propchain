import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Property, PropertyStatus, PropertyType, PropertyAddress, PropertyMetrics } from '../../entities/property.entity';

@Injectable()
export class PropertiesService {
  constructor(private readonly em: EntityManager) {}

  async findAll() {
    return await this.em.find(Property, {}, { populate: ['positions', 'orders'] });
  }

  async findOne(id: string) {
    return await this.em.findOne(Property, { id }, { populate: ['positions', 'orders', 'distributions'] });
  }

  async create(data: {
    name: string;
    description: string;
    address: PropertyAddress;
    type: PropertyType;
    totalValue: number;
    totalShares: number;
    metrics: PropertyMetrics;
  }) {
    const property = this.em.create(Property, {
      ...data,
      status: PropertyStatus.PENDING,
      pricePerShare: data.totalValue / data.totalShares,
      availableShares: data.totalShares,
      contractAddress: `0x${Math.random().toString(16).substr(2, 40)}`, // Mock address for MVP
      tokenSymbol: data.name.toUpperCase().substring(0, 4),
    });

    await this.em.persistAndFlush(property);
    return property;
  }

  async updateAvailableShares(propertyId: string, sharesSold: number) {
    const property = await this.em.findOne(Property, { id: propertyId });
    if (!property) throw new Error('Property not found');

    property.availableShares -= sharesSold;

    if (property.availableShares === 0) {
      property.status = PropertyStatus.FULLY_FUNDED;
      property.fundingCompletedAt = new Date();
    }

    await this.em.persistAndFlush(property);
    return property;
  }

  async getActiveProperties() {
    return await this.em.find(Property, {
      status: { $in: [PropertyStatus.ACTIVE, PropertyStatus.FULLY_FUNDED] }
    });
  }
}