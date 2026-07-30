import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('payment/process')
  @UseGuards(JwtAuthGuard)
  async processPayment(@Body() body: { amount?: number; orderItems?: any[]; couponCode?: string }) {
    return this.paymentsService.processPayment(body);
  }

  @Get('stripeapikey')
  @UseGuards(JwtAuthGuard)
  async getStripeApiKey() {
    return this.paymentsService.getStripeApiKey();
  }
}
