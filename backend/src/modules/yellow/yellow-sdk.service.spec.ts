import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { YellowSDKService } from './yellow-sdk.service';

// Mock WebSocket and ethers modules
jest.mock('ws', () => ({
  WebSocket: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    send: jest.fn(),
    close: jest.fn(),
    readyState: 1, // OPEN state
    CONNECTING: 0,
    OPEN: 1,
    CLOSING: 2,
    CLOSED: 3,
  })),
}));

jest.mock('ethers', () => ({
  ethers: {
    JsonRpcProvider: jest.fn().mockImplementation(() => ({
      getBlockNumber: jest.fn().mockResolvedValue(12345),
      getNetwork: jest.fn().mockResolvedValue({ chainId: 80001n, name: 'polygon-mumbai' }),
    })),
    Wallet: jest.fn().mockImplementation((privateKey: string, provider: any) => ({
      getAddress: jest.fn().mockResolvedValue('0x1234567890123456789012345678901234567890'),
      signMessage: jest.fn().mockResolvedValue('0xmocked-signature'),
      provider,
    })),
  },
}));

describe('YellowSDKService', () => {
  let service: YellowSDKService;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        YellowSDKService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config: Record<string, string> = {
                'BLOCKCHAIN_RPC_URL': 'https://polygon-mumbai.g.alchemy.com/v2/test',
                'YELLOW_PRIVATE_KEY': '0xtest-private-key',
                'YELLOW_WS_ENDPOINT': 'ws://localhost:8080',
                'YELLOW_BROKER_ID': 'test-broker-001',
              };
              return config[key] || null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<YellowSDKService>(YellowSDKService);
    configService = module.get<ConfigService>(ConfigService) as jest.Mocked<ConfigService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Service Initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should have initialized with correct configuration', () => {
      expect(configService.get).toHaveBeenCalledWith('BLOCKCHAIN_RPC_URL');
      expect(configService.get).toHaveBeenCalledWith('YELLOW_WS_ENDPOINT');
    });
  });

  describe('createBrokerSession', () => {
    it('should create a broker session with required fields', async () => {
      const session = await service.createBrokerSession();

      expect(session).toBeDefined();
      expect(session).toHaveProperty('brokerId');
      expect(session).toHaveProperty('sessionId');
      expect(session).toHaveProperty('status');
      expect(session).toHaveProperty('userAddress');
      expect(session.brokerId).toBe('test-broker-001');
    });
  });

  describe('Channel Operations', () => {
    describe('openChannel', () => {
      it('should open a new channel with valid parameters', async () => {
        const participant1 = '0xparticipant1';
        const participant2 = '0xparticipant2';
        const collateral = 1000;

        const channel = await service.openChannel(participant1, participant2, collateral);

        expect(channel).toBeDefined();
        expect(channel.participant1).toBe(participant1);
        expect(channel.participant2).toBe(participant2);
        expect(channel.collateral).toBe(collateral);
        expect(channel.state).toBe('open');
        expect(channel.nonce).toBe(0);
        expect(channel.id).toMatch(/^channel-/);
      });

      it('should create unique channel IDs', async () => {
        const channel1 = await service.openChannel('0xp1', '0xp2', 100);
        const channel2 = await service.openChannel('0xp3', '0xp4', 200);

        expect(channel1.id).not.toBe(channel2.id);
      });
    });

    describe('updateChannel', () => {
      it('should update an existing channel', async () => {
        const channel = await service.openChannel('0xp1', '0xp2', 1000);
        const update = { newBalance: 500 };

        const result = await service.updateChannel(channel.id, update);

        expect(result).toBeDefined();
        expect(result.success).toBe(true);
        expect(result.channelId).toBe(channel.id);
        expect(result.nonce).toBe(1);
      });

      it('should increment nonce on updates', async () => {
        const channel = await service.openChannel('0xp1', '0xp2', 1000);

        const result1 = await service.updateChannel(channel.id, { update: 1 });
        expect(result1.nonce).toBe(1);

        const result2 = await service.updateChannel(channel.id, { update: 2 });
        expect(result2.nonce).toBe(2);
      });

      it('should throw error for non-existent channel', async () => {
        await expect(
          service.updateChannel('invalid-channel-id', {})
        ).rejects.toThrow('Channel not found');
      });
    });

    describe('settleChannel', () => {
      it('should settle an existing channel', async () => {
        const channel = await service.openChannel('0xp1', '0xp2', 1000);

        const result = await service.settleChannel(channel.id);

        expect(result).toBeDefined();
        expect(result.hash).toMatch(/^0x[a-f0-9]+$/);
        expect(result.hash.startsWith('0x')).toBe(true);
        expect(result.wait).toBeDefined();
      });

      it('should mark channel as settled', async () => {
        const channel = await service.openChannel('0xp1', '0xp2', 1000);

        await service.settleChannel(channel.id);
        const settledChannel = service.getChannel(channel.id);

        expect(settledChannel.state).toBe('settled');
      });

      it('should throw error for non-existent channel', async () => {
        await expect(
          service.settleChannel('invalid-channel-id')
        ).rejects.toThrow('Channel not found');
      });

      it('should provide wait function for settlement confirmation', async () => {
        const channel = await service.openChannel('0xp1', '0xp2', 1000);
        const result = await service.settleChannel(channel.id);

        const receipt = await result.wait();

        expect(receipt).toBeDefined();
        expect(receipt.hash).toBe(result.hash);
        expect(receipt.confirmations).toBe(1);
      });
    });
  });

  describe('Utility Methods', () => {
    it('should get all channels', async () => {
      await service.openChannel('0xp1', '0xp2', 1000);
      await service.openChannel('0xp3', '0xp4', 2000);

      const channels = service.getChannels();

      expect(channels).toHaveLength(2);
      expect(channels[0].participant1).toBe('0xp1');
      expect(channels[1].participant1).toBe('0xp3');
    });

    it('should get a specific channel by ID', async () => {
      const channel = await service.openChannel('0xp1', '0xp2', 1000);

      const retrievedChannel = service.getChannel(channel.id);

      expect(retrievedChannel).toBeDefined();
      expect(retrievedChannel.id).toBe(channel.id);
    });

    it('should return null for non-existent channel', () => {
      const channel = service.getChannel('non-existent-id');
      expect(channel).toBeUndefined();
    });

    it('should return connection status', () => {
      const status = service.getConnectionStatus();

      expect(status).toBeDefined();
      expect(status).toHaveProperty('connected');
      expect(status).toHaveProperty('userAddress');
      expect(status).toHaveProperty('channelCount');
    });

    it('should return user address', () => {
      const address = service.getUserAddress();
      expect(address).toBeDefined();
      expect(address).toMatch(/^0x[a-f0-9]{40}$/i);
    });

    it('should return SDK interface', async () => {
      const sdk = await service.getSDK();

      expect(sdk).toBeDefined();
      expect(sdk).toHaveProperty('channels');
      expect(sdk.channels).toHaveProperty('open');
      expect(sdk.channels).toHaveProperty('update');
      expect(sdk.channels).toHaveProperty('settle');
      expect(sdk.channels).toHaveProperty('close');
      expect(sdk).toHaveProperty('authenticate');
    });

    it('should return signer', () => {
      const signer = service.getSigner();
      expect(signer).toBeDefined();
    });

    it('should return provider', () => {
      const provider = service.getProvider();
      expect(provider).toBeDefined();
    });
  });

  describe('WebSocket Message Handling', () => {
    let mockWs: any;
    let messageHandlers: Record<string, Function>;

    beforeEach(() => {
      // Get the WebSocket instance created during service initialization
      const WebSocketMock = require('ws').WebSocket;
      mockWs = WebSocketMock.mock.results[WebSocketMock.mock.results.length - 1].value;

      // Collect message handlers
      messageHandlers = {};
      mockWs.on.mock.calls.forEach((call: any[]) => {
        messageHandlers[call[0]] = call[1];
      });
    });

    it('should handle session_created message', () => {
      const sessionId = 'test-session-123';

      if (messageHandlers['message']) {
        messageHandlers['message'](JSON.stringify({
          type: 'session_created',
          sessionId,
        }));
      }

      expect(service.getSessionId()).toBe(sessionId);
    });

    it('should handle channel_opened message', () => {
      const channelData = {
        id: 'channel-from-ws',
        participant1: '0xp1',
        participant2: '0xp2',
      };

      if (messageHandlers['message']) {
        messageHandlers['message'](JSON.stringify({
          type: 'channel_opened',
          data: channelData,
        }));
      }

      const channel = service.getChannel('channel-from-ws');
      expect(channel).toBeDefined();
      expect(channel.id).toBe('channel-from-ws');
    });

    it('should handle channel_updated message', async () => {
      const channel = await service.openChannel('0xp1', '0xp2', 1000);

      if (messageHandlers['message']) {
        messageHandlers['message'](JSON.stringify({
          type: 'channel_updated',
          data: {
            channelId: channel.id,
            nonce: 5,
          },
        }));
      }

      const updatedChannel = service.getChannel(channel.id);
      expect(updatedChannel.nonce).toBe(5);
    });

    it('should handle channel_settled message', async () => {
      const channel = await service.openChannel('0xp1', '0xp2', 1000);

      if (messageHandlers['message']) {
        messageHandlers['message'](JSON.stringify({
          type: 'channel_settled',
          data: {
            channelId: channel.id,
            txHash: '0xsettlement-tx-hash',
          },
        }));
      }

      const settledChannel = service.getChannel(channel.id);
      expect(settledChannel.state).toBe('settled');
      expect(settledChannel.settlementTx).toBe('0xsettlement-tx-hash');
    });
  });

  describe('Cleanup', () => {
    it('should close WebSocket connection on module destroy', () => {
      const WebSocketMock = require('ws').WebSocket;
      const mockWs = WebSocketMock.mock.results[0].value;

      service.onModuleDestroy();

      expect(mockWs.close).toHaveBeenCalled();
    });

    it('should handle missing WebSocket gracefully on destroy', () => {
      (service as any).ws = null;

      expect(() => service.onModuleDestroy()).not.toThrow();
    });
  });
});