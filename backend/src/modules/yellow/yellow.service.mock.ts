import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';

/**
 * Mock Yellow/Nitrolite service for local development
 * This simulates state channels without requiring the actual SDK
 */
@Injectable()
export class YellowServiceMock {
  private readonly logger = new Logger(YellowServiceMock.name);
  private provider: ethers.Provider;
  private signer: ethers.Signer;
  private mockChannels: Map<string, any> = new Map();

  constructor(private readonly configService: ConfigService) {
    this.initializeProvider();
  }

  private async initializeProvider() {
    // For MVP, we don't need real blockchain connection
    // Everything is simulated in memory
    this.logger.log('Mock Yellow service initialized for local development');
    this.logger.log('Running in simulation mode - no blockchain required');

    // Create mock signer that just returns fake addresses
    this.signer = {
      getAddress: async () => `0x${Math.random().toString(16).substr(2, 40)}`,
      signMessage: async (message: string) => `mock-signature-${Date.now()}`,
    } as any;

    this.provider = {
      getNetwork: async () => ({ chainId: 31337n, name: 'mock' }),
      getBlockNumber: async () => 1,
    } as any;
  }

  async createBrokerSession() {
    // Mock broker session
    return {
      brokerId: 'mock-broker-001',
      sessionId: `session-${Date.now()}`,
      status: 'active',
    };
  }

  async openChannel(participant1: string, participant2: string, collateral: number) {
    const channelId = `channel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const mockChannel = {
      id: channelId,
      participant1,
      participant2,
      collateral,
      state: 'open',
      nonce: 0,
      balances: {
        [participant1]: collateral,
        [participant2]: collateral,
      },
      createdAt: new Date(),
    };

    this.mockChannels.set(channelId, mockChannel);

    this.logger.log(`Mock channel opened: ${channelId}`);
    return mockChannel;
  }

  async updateChannel(channelId: string, update: any) {
    const channel = this.mockChannels.get(channelId);

    if (!channel) {
      throw new Error('Channel not found');
    }

    // Simulate state update
    channel.nonce++;
    channel.lastUpdate = new Date();

    this.logger.log(`Mock channel updated: ${channelId}, nonce: ${channel.nonce}`);

    return {
      success: true,
      channelId,
      nonce: channel.nonce,
      txId: `mock-tx-${Date.now()}`,
    };
  }

  async settleChannel(channelId: string) {
    const channel = this.mockChannels.get(channelId);

    if (!channel) {
      throw new Error('Channel not found');
    }

    // Simulate on-chain settlement
    const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;

    channel.state = 'settled';
    channel.settlementTx = mockTxHash;

    this.logger.log(`Mock channel settled: ${channelId}, tx: ${mockTxHash}`);

    return {
      hash: mockTxHash,
      wait: async () => ({
        hash: mockTxHash,
        blockNumber: 1,
        confirmations: 1,
      }),
    };
  }

  getSigner() {
    return this.signer;
  }

  getProvider() {
    return this.provider;
  }

  async getSDK() {
    // Return a mock SDK object
    return {
      channels: {
        open: this.openChannel.bind(this),
        update: this.updateChannel.bind(this),
        settle: this.settleChannel.bind(this),
        close: this.settleChannel.bind(this),
      },
      authenticate: this.createBrokerSession.bind(this),
    };
  }
}