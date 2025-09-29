import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { YellowService } from './yellow.service';
import { StateChannelService } from './state-channel.service';
import { SettlementService } from './settlement.service';

@ApiTags('yellow')
@Controller('yellow')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class YellowController {
  constructor(
    private readonly yellowService: YellowService,
    private readonly stateChannelService: StateChannelService,
    private readonly settlementService: SettlementService,
  ) {}

  @Post('channel/open')
  @ApiOperation({ summary: 'Open a new state channel' })
  async openChannel(
    @Request() req,
    @Body() body: { counterpartyId: string; collateral: number },
  ) {
    const channel = await this.stateChannelService.openChannel(
      req.user.id,
      body.counterpartyId,
      body.collateral,
    );
    return { success: true, channelId: channel.id };
  }

  @Get('channel/:id')
  @ApiOperation({ summary: 'Get channel state' })
  async getChannelState(@Param('id') channelId: string) {
    const state = await this.stateChannelService.getChannelState(channelId);
    return {
      channelId,
      state: state ? {
        participants: state.participants,
        balances: Array.from(state.balances.entries()),
        nonce: state.nonce,
        status: state.status,
      } : null,
    };
  }

  @Post('channel/:id/close')
  @ApiOperation({ summary: 'Close a state channel' })
  async closeChannel(@Param('id') channelId: string) {
    const closure = await this.stateChannelService.closeChannel(channelId);
    return { success: true, closure };
  }

  @Post('settlement/request')
  @ApiOperation({ summary: 'Request immediate settlement' })
  async requestSettlement(@Body() body: { channelId: string }) {
    const result = await this.settlementService.requestImmediateSettlement(body.channelId);
    return result;
  }

  @Get('status')
  @ApiOperation({ summary: 'Get Yellow Network connection status' })
  async getStatus() {
    const sdk = await this.yellowService.getSDK();
    return {
      connected: sdk ? true : false,
      network: 'testnet',
      brokerId: process.env.YELLOW_BROKER_ID,
    };
  }
}