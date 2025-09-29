import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Order } from '../../entities/order.entity';
import { Property } from '../../entities/property.entity';
import { User } from '../../entities/user.entity';
import { Position } from '../../entities/position.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { YellowModule } from '../yellow/yellow.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([Order, Property, User, Position]),
    YellowModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}