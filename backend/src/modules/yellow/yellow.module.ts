import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { YellowService } from './yellow.service';
import { YellowController } from './yellow.controller';
import { StateChannelService } from './state-channel.service';
import { SettlementService } from './settlement.service';

@Module({
  imports: [ConfigModule],
  controllers: [YellowController],
  providers: [YellowService, StateChannelService, SettlementService],
  exports: [YellowService, StateChannelService, SettlementService],
})
export class YellowModule {}