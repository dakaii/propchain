import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { YellowService } from './yellow.service';
import { StateChannelService } from './state-channel.service';
import { EntityManager } from '@mikro-orm/core';
import { Order, OrderStatus } from '../../entities/order.entity';

@Injectable()
export class SettlementService {
  private readonly logger = new Logger(SettlementService.name);
  private pendingSettlements: Map<string, any> = new Map();

  constructor(
    private readonly yellowService: YellowService,
    private readonly stateChannelService: StateChannelService,
    private readonly em: EntityManager,
  ) {}

  // Run settlement every hour for the hackathon (in production, this would be more sophisticated)
  @Cron(CronExpression.EVERY_HOUR)
  async processSettlements() {
    this.logger.log('Processing batch settlements...');

    try {
      const sdk = await this.yellowService.getSDK();

      // Get all orders that need settling
      const ordersToSettle = await this.em.find(Order, {
        status: OrderStatus.MATCHED,
        settledAt: null,
      });

      if (ordersToSettle.length === 0) {
        this.logger.log('No orders to settle');
        return;
      }

      // Group orders by channel
      const ordersByChannel = new Map<string, Order[]>();
      for (const order of ordersToSettle) {
        if (order.yellowChannelId) {
          const existing = ordersByChannel.get(order.yellowChannelId) || [];
          existing.push(order);
          ordersByChannel.set(order.yellowChannelId, existing);
        }
      }

      // Process settlements for each channel
      for (const [channelId, orders] of ordersByChannel) {
        await this.settleChannel(channelId, orders);
      }

      this.logger.log(`Settled ${ordersToSettle.length} orders across ${ordersByChannel.size} channels`);
    } catch (error) {
      this.logger.error('Settlement processing failed:', error);
    }
  }

  async settleChannel(channelId: string, orders: Order[]) {
    try {
      const sdk = await this.yellowService.getSDK();
      const channelState = await this.stateChannelService.getChannelState(channelId);

      if (!channelState) {
        this.logger.error(`Channel state not found: ${channelId}`);
        return;
      }

      // Calculate net positions
      const netPositions = this.calculateNetPositions(orders);

      // Submit to blockchain
      const settlementTx = await sdk.channels.settle({
        channelId,
        finalBalances: Array.from(channelState.balances.entries()),
        nonce: channelState.nonce,
      });

      // Wait for confirmation
      const receipt = await settlementTx.wait();

      // Update orders with settlement info
      for (const order of orders) {
        order.status = OrderStatus.SETTLED;
        order.settledAt = new Date();
        order.txHash = receipt.hash;
      }

      await this.em.persistAndFlush(orders);

      this.logger.log(`Channel ${channelId} settled on-chain: ${receipt.hash}`);
      return receipt;
    } catch (error) {
      this.logger.error(`Failed to settle channel ${channelId}:`, error);
      throw error;
    }
  }

  private calculateNetPositions(orders: Order[]): Map<string, number> {
    const positions = new Map<string, number>();

    for (const order of orders) {
      const userKey = order.user.walletAddress;
      const currentPosition = positions.get(userKey) || 0;

      if (order.type === 'buy') {
        positions.set(userKey, currentPosition + order.quantity);
      } else {
        positions.set(userKey, currentPosition - order.quantity);
      }
    }

    return positions;
  }

  async requestImmediateSettlement(channelId: string) {
    try {
      const orders = await this.em.find(Order, {
        yellowChannelId: channelId,
        status: OrderStatus.MATCHED,
      });

      if (orders.length > 0) {
        const receipt = await this.settleChannel(channelId, orders);
        return {
          success: true,
          txHash: receipt.hash,
          ordersSettled: orders.length,
        };
      }

      return {
        success: false,
        message: 'No orders to settle',
      };
    } catch (error) {
      this.logger.error('Immediate settlement failed:', error);
      throw error;
    }
  }
}