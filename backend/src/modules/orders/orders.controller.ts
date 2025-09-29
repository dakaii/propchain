import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrderType } from '../../entities/order.entity';

@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  async createOrder(
    @Request() req,
    @Body() createOrderDto: {
      propertyId: string;
      type: OrderType;
      quantity: number;
      price: number;
    }
  ) {
    return await this.ordersService.createOrder(
      req.user.id,
      createOrderDto.propertyId,
      createOrderDto.type,
      createOrderDto.quantity,
      createOrderDto.price,
    );
  }

  @Get('my-orders')
  @ApiOperation({ summary: 'Get current user orders' })
  async getMyOrders(@Request() req) {
    return await this.ordersService.getUserOrders(req.user.id);
  }

  @Get('property/:propertyId')
  @ApiOperation({ summary: 'Get orders for a property' })
  async getPropertyOrders(@Param('propertyId') propertyId: string) {
    return await this.ordersService.getPropertyOrders(propertyId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel an order' })
  async cancelOrder(@Param('id') id: string, @Request() req) {
    return await this.ordersService.cancelOrder(id, req.user.id);
  }
}