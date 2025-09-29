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
    const property = await this.em.findOne(Property, { id: propertyId });

    if (!user || !property) {
      throw new BadRequestException('User or property not found');
    }

    if (type === OrderType.BUY && quantity > property.availableShares) {
      throw new BadRequestException('Not enough shares available');
    }

    const order = this.em.create(Order, {
      user,
      property,
      type,
      quantity,
      price,
      totalAmount: quantity * price,
      status: OrderStatus.PENDING,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    await this.em.persistAndFlush(order);

    // Try to match the order immediately
    await this.matchOrder(order);

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

  async updatePositions(buyOrder: Order, sellOrder: Order) {
    // Update buyer's position
    let buyerPosition = await this.em.findOne(Position, {
      user: buyOrder.user,
      property: buyOrder.property,
    });

    if (!buyerPosition) {
      buyerPosition = this.em.create(Position, {
        user: buyOrder.user,
        property: buyOrder.property,
        shares: 0,
        averagePrice: buyOrder.price,
        totalInvested: 0,
        currentValue: 0,
      });
    }

    buyerPosition.shares += buyOrder.filledQuantity;
    buyerPosition.totalInvested += buyOrder.filledQuantity * buyOrder.price;
    buyerPosition.averagePrice = buyerPosition.totalInvested / buyerPosition.shares;
    buyerPosition.currentValue = buyerPosition.shares * buyOrder.property.pricePerShare;

    await this.em.persistAndFlush(buyerPosition);
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