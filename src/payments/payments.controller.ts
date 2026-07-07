import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('payment/process')
  @UseGuards(JwtAuthGuard)
  async processPayment(@Body('amount') amount: number) {
    return this.paymentsService.processPayment(amount);
  }

  @Get('stripeapikey')
  @UseGuards(JwtAuthGuard)
  async getStripeApiKey() {
    return this.paymentsService.getStripeApiKey();
  }
}
