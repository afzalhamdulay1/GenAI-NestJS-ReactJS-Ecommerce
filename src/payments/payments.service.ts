import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { SettingsService, OrderItemInput } from '../settings/settings.service';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    private settingsService: SettingsService,
  ) {
    this.stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY') as string, {
      apiVersion: '2025-01-27.acacia' as any,
    });
  }

  async processPayment(payload: { amount?: number; orderItems?: OrderItemInput[]; couponCode?: string }) {
    let finalAmountInPaise = 0;

    if (payload.orderItems && payload.orderItems.length > 0) {
      // Server-Verified Calculation directly from MongoDB & active Settings
      const pricing = await this.settingsService.calculatePricing(payload.orderItems, payload.couponCode);
      finalAmountInPaise = Math.round(pricing.totalPrice * 100);
    } else if (payload.amount) {
      finalAmountInPaise = Math.round(payload.amount);
    } else {
      throw new Error('Order items or payment amount must be provided');
    }

    const myPayment = await this.stripe.paymentIntents.create({
      amount: finalAmountInPaise,
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

  async refundPayment(paymentIntentId: string) {
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
      });
      return {
        success: true,
        status: refund.status,
      };
    } catch (error: any) {
      console.error('Stripe refund error:', error);
      throw new Error(`Refund failed: ${error.message}`);
    }
  }
}
