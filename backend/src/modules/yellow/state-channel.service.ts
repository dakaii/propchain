import { Injectable, Logger } from '@nestjs/common';
import { YellowService } from './yellow.service';
import { EntityManager } from '@mikro-orm/core';
import { User } from '../../entities/user.entity';
import { Order } from '../../entities/order.entity';

export interface ChannelState {
  channelId: string;
  participants: string[];
  balances: Map<string, number>;
  nonce: number;
  status: 'open' | 'closing' | 'closed';
}

@Injectable()
export class StateChannelService {
  private readonly logger = new Logger(StateChannelService.name);
  private channels: Map<string, ChannelState> = new Map();

  constructor(
    private readonly yellowService: YellowService,
    private readonly em: EntityManager,
  ) {}

  async openChannel(userId: string, counterpartyId: string, collateral: number) {
    try {
      const sdk = await this.yellowService.getSDK();

      // Open state channel using ERC-7824
      const channel = await sdk.channels.open({
        participant1: userId,
        participant2: counterpartyId,
        collateralAmount: collateral,
        tokenAddress: '0x0000000000000000000000000000000000000000', // ETH for now
      });

      const channelState: ChannelState = {
        channelId: channel.id,
        participants: [userId, counterpartyId],
        balances: new Map([[userId, collateral], [counterpartyId, collateral]]),
        nonce: 0,
        status: 'open',
      };

      this.channels.set(channel.id, channelState);

      // Update user with channel ID
      const user = await this.em.findOne(User, { id: userId });
      if (user) {
        user.yellowChannelId = channel.id;
        await this.em.persistAndFlush(user);
      }

      this.logger.log(`State channel opened: ${channel.id}`);
      return channel;
    } catch (error) {
      this.logger.error('Failed to open state channel:', error);
      throw error;
    }
  }

  async updateChannelState(
    channelId: string,
    asset: string,
    amount: number,
    from: string,
    to: string,
  ) {
    try {
      const sdk = await this.yellowService.getSDK();
      const channel = this.channels.get(channelId);

      if (!channel) {
        throw new Error('Channel not found');
      }

      // Update off-chain balances
      const fromBalance = channel.balances.get(from) || 0;
      const toBalance = channel.balances.get(to) || 0;

      if (fromBalance < amount) {
        throw new Error('Insufficient balance in channel');
      }

      channel.balances.set(from, fromBalance - amount);
      channel.balances.set(to, toBalance + amount);
      channel.nonce++;

      // Sign and broadcast state update
      const stateUpdate = await sdk.channels.update({
        channelId,
        asset,
        amount,
        from,
        to,
        nonce: channel.nonce,
      });

      this.logger.log(`Channel state updated: ${channelId}, nonce: ${channel.nonce}`);
      return stateUpdate;
    } catch (error) {
      this.logger.error('Failed to update channel state:', error);
      throw error;
    }
  }

  async processOrder(order: Order) {
    try {
      // Get or create channel for this order
      const channelId = order.yellowChannelId || await this.getOrCreateChannel(
        order.user.id,
        order.property.contractAddress,
      );

      // Process the order through state channel
      const update = await this.updateChannelState(
        channelId,
        order.property.contractAddress, // Token address
        order.quantity,
        order.type === 'buy' ? order.user.walletAddress : order.property.contractAddress,
        order.type === 'buy' ? order.property.contractAddress : order.user.walletAddress,
      );

      // Update order with channel info
      order.yellowChannelId = channelId;
      order.yellowTransactionId = update.txId;

      return update;
    } catch (error) {
      this.logger.error('Failed to process order through state channel:', error);
      throw error;
    }
  }

  async getOrCreateChannel(userId: string, propertyAddress: string) {
    // Check if channel exists
    const existingChannel = Array.from(this.channels.values()).find(
      ch => ch.participants.includes(userId) && ch.participants.includes(propertyAddress)
    );

    if (existingChannel) {
      return existingChannel.channelId;
    }

    // Create new channel
    const channel = await this.openChannel(userId, propertyAddress, 10000); // Default collateral
    return channel.id;
  }

  async closeChannel(channelId: string) {
    try {
      const sdk = await this.yellowService.getSDK();
      const channel = this.channels.get(channelId);

      if (!channel) {
        throw new Error('Channel not found');
      }

      channel.status = 'closing';

      // Initiate channel closure
      const closure = await sdk.channels.close({
        channelId,
        finalState: {
          balances: Array.from(channel.balances.entries()),
          nonce: channel.nonce,
        },
      });

      this.logger.log(`Channel closure initiated: ${channelId}`);
      return closure;
    } catch (error) {
      this.logger.error('Failed to close channel:', error);
      throw error;
    }
  }

  async getChannelState(channelId: string): Promise<ChannelState | undefined> {
    return this.channels.get(channelId);
  }
}