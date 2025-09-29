import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { YellowServiceMock } from './yellow-mock.service';

// We'll conditionally import the SDK service only when needed
let YellowSDKService: any = null;

@Injectable()
export class YellowService {
  private implementation: YellowServiceMock | any;

  constructor(private readonly configService: ConfigService) {
    // Check if we should use real Yellow SDK or mock
    const useYellowSDK = this.configService.get('NODE_ENV') === 'production' || 
                        this.configService.get('USE_YELLOW_SDK') === 'true';

    if (useYellowSDK) {
      try {
        // Dynamically import the SDK service only when needed
        YellowSDKService = require('./yellow-sdk.service').YellowSDKService;
        console.log('🟡 Using Yellow SDK implementation');
        this.implementation = new YellowSDKService(configService);
      } catch (error) {
        console.warn('⚠️  Failed to load Yellow SDK, falling back to mock:', error.message);
        console.log('🟨 Using mock implementation (fallback)');
        this.implementation = new YellowServiceMock(configService);
      }
    } else {
      console.log('🟨 Using mock implementation (for development)');
      this.implementation = new YellowServiceMock(configService);
    }
  }

  // Delegate all methods to the chosen implementation
  async createBrokerSession() {
    return this.implementation.createBrokerSession();
  }

  async openChannel(participant1: string, participant2: string, collateral: number) {
    return this.implementation.openChannel(participant1, participant2, collateral);
  }

  async updateChannel(channelId: string, update: any) {
    return this.implementation.updateChannel(channelId, update);
  }

  async settleChannel(channelId: string) {
    return this.implementation.settleChannel(channelId);
  }

  getSigner() {
    return this.implementation.getSigner();
  }

  getProvider() {
    return this.implementation.getProvider();
  }

  async getSDK() {
    return this.implementation.getSDK();
  }

  // Additional methods with fallbacks
  getChannels() {
    if (this.implementation.getChannels) {
      return this.implementation.getChannels();
    }
    return [];
  }

  getChannel(channelId: string) {
    if (this.implementation.getChannel) {
      return this.implementation.getChannel(channelId);
    }
    return null;
  }

  isConnected() {
    if (this.implementation.isConnected) {
      return this.implementation.isConnected();
    }
    return true; // Mock is always "connected"
  }

  getSessionId() {
    if (this.implementation.getSessionId) {
      return this.implementation.getSessionId();
    }
    return 'mock-session-123';
  }

  getConnectionStatus() {
    if (this.implementation.getConnectionStatus) {
      return this.implementation.getConnectionStatus();
    }
    return {
      connected: true,
      implementation: 'mock',
      sessionId: 'mock-session-123',
      channelCount: 0,
      sdkReady: true
    };
  }

  // Get the current implementation type
  getImplementationType(): 'mock' | 'sdk' {
    return YellowSDKService && this.implementation instanceof YellowSDKService ? 'sdk' : 'mock';
  }
}
