import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  Param,
  Query,
  UseGuards,
  Delete,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { UserDocument } from '../users/schemas/user.schema';

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('order/new')
  @UseGuards(OptionalJwtAuthGuard)
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser() user: UserDocument,
  ) {
    return this.ordersService.createOrder(createOrderDto, user);
  }

  @Get('order/guest/:id')
  async getGuestOrder(
    @Param('id') id: string,
    @Query('token') token: string,
  ) {
    return this.ordersService.getGuestOrder(id, token);
  }

  @Put('order/guest/:id/cancel')
  async cancelGuestOrder(
    @Param('id') id: string,
    @Query('token') token: string,
  ) {
    return this.ordersService.cancelGuestOrder(id, token);
  }

  @Get('order/guest/:id/invoice')
  async downloadGuestInvoice(
    @Param('id') id: string,
    @Query('token') token: string,
    @Res() res: any,
  ) {
    return this.ordersService.downloadGuestInvoice(id, token, res);
  }

  @Get('order/:id/invoice')
  @UseGuards(JwtAuthGuard)
  async downloadInvoice(
    @Param('id') id: string,
    @CurrentUser() user: UserDocument,
    @Res() res: any,
  ) {
    return this.ordersService.downloadInvoice(id, user, res);
  }

  @Get('order/:id')
  @UseGuards(JwtAuthGuard)
  async getSingleOrder(@Param('id') id: string) {
    return this.ordersService.getSingleOrder(id);
  }

  @Get('orders/me')
  @UseGuards(JwtAuthGuard)
  async myOrders(@CurrentUser() user: UserDocument) {
    return this.ordersService.myOrders(user);
  }

  @Put('order/:id/cancel')
  @UseGuards(JwtAuthGuard)
  async cancelMyOrder(
    @Param('id') id: string,
    @CurrentUser() user: UserDocument,
  ) {
    return this.ordersService.cancelMyOrder(id, user);
  }

  // Admin Routes
  @Get('admin/orders')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getAllOrders() {
    return this.ordersService.getAllOrders();
  }

  @Put('admin/order/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async updateOrder(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateOrder(id, updateOrderStatusDto);
  }

  @Delete('admin/order/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async deleteOrder(@Param('id') id: string) {
    return this.ordersService.deleteOrder(id);
  }
}
