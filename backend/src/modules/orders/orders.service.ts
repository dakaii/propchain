import { Injectable, BadRequestException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Order, OrderType, OrderStatus } from '../../entities/order.entity';
import { User } from '../../entities/user.entity';
import { Property } from '../../entities/property.entity';
import { Position } from '../../entities/position.entity';
import { StateChannelService } from '../yellow/state-channel.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly em: EntityManager,
    private readonly stateChannelService: StateChannelService,
  ) {}

  async createOrder(
    userId: string,
    propertyId: string,
    type: OrderType,
    quantity: number,
    price: number,
  ) {
    const user = await this.em.findOne(User, { id: userId });
    const property = await this.em.findOne(Property, { id: propertyId }, {
      populate: ['positions'],
    });

    if (!user || !property) {
      throw new BadRequestException('User or property not found');
    }

    // Check available shares for buy orders
    if (type === OrderType.BUY && quantity > property.availableShares) {
      throw new BadRequestException('Not enough shares available');
    }

    // Check user's position for sell orders
    if (type === OrderType.SELL) {
      const position = await this.em.findOne(Position, {
        user: { id: userId },
        property: { id: propertyId },
      });

      if (!position || position.shares < quantity) {
        throw new BadRequestException('Not enough shares owned to sell');
      }
    }

    const order = this.em.create(Order, {
      user,
      property,
      type,
      quantity,
      price,
      totalAmount: quantity * price,
      status: OrderStatus.MATCHED, // Execute immediately for MVP
      filledQuantity: quantity,
      matchedAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    await this.em.persistAndFlush(order);

    // Execute the order immediately (MVP approach - no order book matching)
    await this.executeOrder(order);

    return order;
  }

  async matchOrder(order: Order) {
    // Simple matching logic for MVP
    // In production, this would be a proper order book
    const oppositeType = order.type === OrderType.BUY ? OrderType.SELL : OrderType.BUY;

    const matchingOrder = await this.em.findOne(Order, {
      property: order.property,
      type: oppositeType,
      status: OrderStatus.PENDING,
      price: { $lte: order.price }, // For buy orders, match with lower sell prices
      id: { $ne: order.id },
    });

    if (matchingOrder) {
      // Match found - execute trade through state channel
      const matchQuantity = Math.min(order.quantity, matchingOrder.quantity);

      // Update orders
      order.status = OrderStatus.MATCHED;
      order.filledQuantity = matchQuantity;
      order.matchedWithOrderId = matchingOrder.id;
      order.matchedAt = new Date();

      matchingOrder.status = OrderStatus.MATCHED;
      matchingOrder.filledQuantity = matchQuantity;
      matchingOrder.matchedWithOrderId = order.id;
      matchingOrder.matchedAt = new Date();

      // Process through state channel (mock for MVP)
      try {
        await this.stateChannelService.processOrder(order);
        await this.stateChannelService.processOrder(matchingOrder);
      } catch (error) {
        console.error('State channel processing failed:', error);
      }

      // Update position
      await this.updatePositions(order, matchingOrder);

      await this.em.persistAndFlush([order, matchingOrder]);
    }

    return order;
  }

  async executeOrder(order: Order) {
    const property = await this.em.findOne(Property, { id: order.property.id });

    if (order.type === OrderType.BUY) {
      // For buy orders: create or update buyer's position
      let position = await this.em.findOne(Position, {
        user: order.user,
        property: order.property,
      });

      if (!position) {
        position = this.em.create(Position, {
          user: order.user,
          property: order.property,
          shares: 0,
          averagePrice: 0,
          totalInvested: 0,
          currentValue: 0,
          unrealizedGains: 0,
          realizedGains: 0,
        });
      }

      // Update position
      const newShares = position.shares + order.filledQuantity;
      const newInvestment = order.filledQuantity * order.price;
      position.totalInvested += newInvestment;
      position.shares = newShares;
      position.averagePrice = position.totalInvested / position.shares;
      position.currentValue = position.shares * property.pricePerShare;
      position.unrealizedGains = position.currentValue - position.totalInvested;

      // Update property available shares
      property.availableShares -= order.filledQuantity;

      await this.em.persistAndFlush([position, property]);
    } else if (order.type === OrderType.SELL) {
      // For sell orders: update seller's position
      const position = await this.em.findOne(Position, {
        user: order.user,
        property: order.property,
      });

      if (!position) {
        throw new BadRequestException('Position not found');
      }

      // Calculate realized gains
      const saleProceeds = order.filledQuantity * order.price;
      const costBasis = (position.totalInvested / position.shares) * order.filledQuantity;
      const realizedGain = saleProceeds - costBasis;

      // Update position
      position.shares -= order.filledQuantity;
      position.totalInvested -= costBasis;
      position.realizedGains += realizedGain;

      if (position.shares > 0) {
        position.currentValue = position.shares * property.pricePerShare;
        position.unrealizedGains = position.currentValue - position.totalInvested;
      } else {
        // If all shares sold, reset position values
        position.currentValue = 0;
        position.unrealizedGains = 0;
        position.totalInvested = 0;
        position.averagePrice = 0;
      }

      // Update property available shares (shares go back to the pool)
      property.availableShares += order.filledQuantity;

      await this.em.persistAndFlush([position, property]);
    }

    // Process through state channel (mock for MVP)
    try {
      await this.stateChannelService.processOrder(order);
    } catch (error) {
      console.error('State channel processing failed:', error);
    }
  }

  async updatePositions(buyOrder: Order, sellOrder: Order) {
    // This method is now deprecated in favor of executeOrder
    // Kept for backward compatibility but not used
  }

  async getUserOrders(userId: string) {
    return await this.em.find(Order, { user: { id: userId } }, {
      populate: ['property'],
      orderBy: { createdAt: 'DESC' },
    });
  }

  async getPropertyOrders(propertyId: string) {
    return await this.em.find(Order, { property: { id: propertyId } }, {
      populate: ['user'],
      orderBy: { createdAt: 'DESC' },
    });
  }

  async cancelOrder(orderId: string, userId: string) {
    const order = await this.em.findOne(Order, {
      id: orderId,
      user: { id: userId },
      status: OrderStatus.PENDING,
    });

    if (!order) {
      throw new BadRequestException('Order not found or cannot be cancelled');
    }

    order.status = OrderStatus.CANCELLED;
    await this.em.persistAndFlush(order);

    return order;
  }
}