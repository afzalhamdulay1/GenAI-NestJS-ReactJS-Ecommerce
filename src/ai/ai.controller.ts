import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  /**
   * Admin Endpoint: Auto-generate product description using Gemini AI
   */
  @Post('generate-description')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async generateProductDescription(
    @Body('name') name: string,
    @Body('category') category?: string,
  ) {
    return this.aiService.generateProductDescription(name, category);
  }

  /**
   * Public Customer Endpoint: Conversational AI Shopping Assistant Chatbot
   */
  @Post('chat')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async chatWithAssistant(
    @Body('message') message: string,
    @Body('history') history?: any[],
  ) {
    return this.aiService.chatWithShoppingAssistant(message, history);
  }

  /**
   * Public Customer Endpoint: AI Review Sentiment Summarizer
   */
  @Get('summarize-reviews/:productId')
  async summarizeReviews(@Param('productId') productId: string) {
    return this.aiService.summarizeProductReviews(productId);
  }

  /**
   * Public Customer Endpoint: AI Smart Cart Recommendations ("Complete the Look")
   */
  @Post('recommend-complementary')
  @Throttle({ default: { limit: 15, ttl: 60000 } })
  async recommendComplementary(@Body('cartItemIds') cartItemIds: string[]) {
    return this.aiService.recommendComplementaryProducts(cartItemIds || []);
  }

  /**
   * Public Customer Endpoint: AI Visual Image Search
   */
  @Post('visual-search')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async visualSearch(@Body('image') image: string) {
    return this.aiService.visualImageSearch(image);
  }

  /**
   * Admin Endpoint: AI Store Intelligence & Executive Analytics
   */
  @Get('store-insights')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getStoreExecutiveInsights() {
    return this.aiService.getStoreExecutiveInsights();
  }

  /**
   * Admin Endpoint: AI SEO Meta & Tag Generator
   */
  @Post('generate-seo')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async generateSeoMetaData(
    @Body('name') name: string,
    @Body('category') category?: string,
    @Body('description') description?: string,
  ) {
    return this.aiService.generateSeoMetaData(name, category, description);
  }

  /**
   * Public Customer Endpoint: AI Product Q&A Assistant
   */
  @Post('product-qa')
  @Throttle({ default: { limit: 8, ttl: 60000 } })
  async askProductQuestion(
    @Body('productId') productId: string,
    @Body('question') question: string,
  ) {
    return this.aiService.askProductQuestion(productId, question);
  }

  /**
   * Public Customer Endpoint: AI Smart Cart Upsell Nudge ("AOV Booster")
   */
  @Post('cart-upsell-nudge')
  @Throttle({ default: { limit: 15, ttl: 60000 } })
  async getCartUpsellNudge(
    @Body('cartItemIds') cartItemIds: string[],
    @Body('subtotal') subtotal: number,
  ) {
    return this.aiService.getCartUpsellNudge(cartItemIds || [], subtotal || 0);
  }
}
