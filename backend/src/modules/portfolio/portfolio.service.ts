import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Position } from '../../entities/position.entity';
import { User } from '../../entities/user.entity';

@Injectable()
export class PortfolioService {
  constructor(private readonly em: EntityManager) {}

  async getUserPortfolio(userId: string) {
    const positions = await this.em.find(Position, { user: { id: userId } }, {
      populate: ['property'],
    });

    const totalInvested = positions.reduce((sum, p) => sum + p.totalInvested, 0);
    const currentValue = positions.reduce((sum, p) => sum + p.currentValue, 0);
    const totalReturns = positions.reduce((sum, p) => sum + p.totalDistributions + p.realizedGains, 0);

    return {
      positions,
      summary: {
        totalInvested,
        currentValue,
        totalReturns,
        unrealizedGains: currentValue - totalInvested,
        totalProperties: positions.length,
      },
    };
  }

  async getPosition(userId: string, propertyId: string) {
    return await this.em.findOne(Position, {
      user: { id: userId },
      property: { id: propertyId },
    }, {
      populate: ['property'],
    });
  }

  async getTopInvestors() {
    const users = await this.em.find(User, {}, {
      populate: ['positions'],
      orderBy: { totalInvested: 'DESC' },
      limit: 10,
    });

    return users.map(user => ({
      id: user.id,
      email: user.email,
      totalInvested: user.totalInvested,
      totalReturns: user.totalReturns,
      propertyCount: user.positions.length,
    }));
  }
}