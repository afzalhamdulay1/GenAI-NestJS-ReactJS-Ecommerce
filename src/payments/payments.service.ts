import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    this.stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY') as string, {
      apiVersion: '2025-01-27.acacia' as any,
    });
  }

  async processPayment(amount: number) {
    const myPayment = await this.stripe.paymentIntents.create({
      amount,
      currency: 'inr',
      metadata: {
        company: 'Ecommerce',
      },
    });

    return {
      success: true,
      client_secret: myPayment.client_secret,
    };
  }

  getStripeApiKey() {
    return {
      stripeApiKey: this.configService.get<string>('STRIPE_API_KEY'),
    };
  }
}
