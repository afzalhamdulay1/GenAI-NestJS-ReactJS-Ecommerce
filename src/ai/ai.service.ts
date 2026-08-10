import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Model } from 'mongoose';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Settings, SettingsDocument } from '../settings/schemas/settings.schema';

@Injectable()
export class AiService {
  private genAI: GoogleGenerativeAI | null = null;

  constructor(
    private configService: ConfigService,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Settings.name) private settingsModel: Model<SettingsDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  private getGenAI(): GoogleGenerativeAI {
    if (!this.genAI) {
      const apiKey = this.configService.get<string>('GEMINI_API_KEY');
      if (!apiKey) {
        throw new BadRequestException(
          'GEMINI_API_KEY is missing in server environment variables.',
        );
      }
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
    return this.genAI;
  }

  /**
   * 1. Admin Feature: Generate SEO-optimized product description
   */
  async generateProductDescription(name: string, category?: string) {
    if (!name || !name.trim()) {
      throw new BadRequestException(
        'Product name is required for AI generation',
      );
    }

    try {
      const genAI = this.getGenAI();
      const prompt = `You are an expert e-commerce copywriter. Write a compelling, professional, SEO-optimized product description for a product named "${name}"${category ? ` in the category "${category}"` : ''}.
Structure the response cleanly with 2 brief engaging paragraphs wrapped in <p> tags, followed by 3-4 bullet points inside a <ul> with <li> tags, and feature titles bolded using <strong> tags.
CRITICAL REQUIREMENT: Return strictly standard HTML tags (<p>, <ul>, <li>, <strong>). Do NOT use any Markdown syntax like "*", "**", "#", or "-". Do NOT wrap the HTML in backticks or code blocks like \`\`\`html.`;

      const modelsToTry = [
        'gemini-3.5-flash',
        'gemini-flash-latest',
        'gemini-3.5-flash-lite',
        'gemini-3.1-flash-lite',
      ];
      let responseText = '';

      for (const modelName of modelsToTry) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent(prompt);
          const response = await result.response;
          responseText = response.text();
          if (responseText) {
            responseText = responseText
              .replace(/```html/gi, '')
              .replace(/```/g, '')
              .trim();
            break;
          }
        } catch (err: any) {
          console.warn(`Model ${modelName} failed: ${err.message}`);
        }
      }

      return {
        success: true,
        description: responseText ? responseText.trim() : '',
      };
    } catch (error: any) {
      throw new InternalServerErrorException(
        `AI Generation failed: ${error?.message || 'Gemini API error'}`,
      );
    }
  }

  /**
   * 2. Storefront Feature: Conversational AI Shopping Assistant Chatbot
   */
  async chatWithShoppingAssistant(
    userMessage: string,
    chatHistory: any[] = [],
  ) {
    if (!userMessage || !userMessage.trim()) {
      throw new BadRequestException('Message cannot be empty');
    }

    try {
      const genAI = this.getGenAI();

      // Fetch live product context from MongoDB to ground the bot
      const products = await this.productModel
        .find()
        .select(
          'name price originalPrice category stock ratings numOfReviews description images _id hasVariants options variants',
        )
        .limit(30)
        .lean();

      const inventoryContext = products
        .map((p: any) => {
          let discountStr = '';
          if (p.originalPrice && p.originalPrice > p.price) {
            const pct = Math.round(
              ((p.originalPrice - p.price) / p.originalPrice) * 100,
            );
            discountStr = ` | 🔥 ON SALE! (Original: ₹${p.originalPrice}, Discount: ${pct}% OFF)`;
          }

          let variantStr = '';
          if (p.hasVariants && p.options && p.options.length > 0) {
            const optionsSummary = p.options
              .map((o: any) => `${o.name}: ${o.values.join(', ')}`)
              .join('; ');

            let detailedVariantsStr = '';
            if (Array.isArray(p.variants) && p.variants.length > 0) {
              const variantDetails = p.variants
                .map((v: any) => {
                  const attrs = Object.entries(v.attributes || {})
                    .map(([key, val]) => `${key}: ${val}`)
                    .join(', ');
                  const priceInfo = v.price ? `, Price: ₹${v.price}` : '';
                  return `[${attrs} -> Stock: ${v.stock}${priceInfo}]`;
                })
                .join('; ');
              detailedVariantsStr = ` | Detailed Variant Stock Breakdown: ${variantDetails}`;
            }

            variantStr = ` | Available Options: (${optionsSummary})${detailedVariantsStr}`;
          }
          return `- ID: ${p._id} | Name: "${p.name}" | Price: ₹${p.price}${discountStr} | Category: ${p.category} | Total Stock: ${p.stock}${variantStr} | Rating: ${p.ratings}⭐`;
        })
        .join('\n');

      const systemInstruction = `You are "Afzal AI", the helpful, friendly AI Shopping Assistant for our E-Commerce Store.
Your job is to assist customers in finding products, answering questions, giving style/buying advice, and making recommendations.

Here is our CURRENT live product catalog from our database:
${inventoryContext}

RULES FOR YOUR RESPONSES:
1. Always be polite, enthusiastic, and EXTREMELY concise.
2. For simple greetings (like "Hi"), just greet back and ask how you can help. Do NOT list categories or products.
3. Only recommend products if the user explicitly asks for a recommendation, searches for an item, or asks what you have.
4. When recommending a product, mention its exact Name, Price, and why it fits their request.
5. If a user asks about availability or stock for a product or specific variant combination (size, color, etc.), check "Detailed Variant Stock Breakdown" and stock levels:
   - If stock is high (> 5 items): Enthusiastically confirm that it is "In Stock and available to order!" (Do NOT disclose large exact numbers like 90, 50, etc.).
   - If stock is LOW (5 or fewer items): Create healthy purchase urgency by stating: "Hurry! Only X left in stock for [Size/Color]!"
   - If stock is 0: Inform them politely that it is currently Out of Stock and offer the closest in-stock alternative.
6. If a user asks for items on sale, deals, or discounts, look for products marked "🔥 ON SALE!" in the catalog and present them enthusiastically with their sale prices and discount percentages!
7. If a user asks about something out of stock or not in catalog, suggest closest alternative politely.
8. Format your text cleanly with emoji bullet points where helpful.`;

      const formattedHistory: any[] = [];
      if (Array.isArray(chatHistory) && chatHistory.length > 0) {
        // Filter out initial bot welcome message so history strictly starts with 'user'
        const filtered = chatHistory.filter((m) => m.id !== 'welcome');
        filtered.slice(-6).forEach((msg) => {
          formattedHistory.push({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }],
          });
        });

        // GoogleGenerativeAI requires history array to start with a 'user' role
        if (
          formattedHistory.length > 0 &&
          formattedHistory[0].role === 'model'
        ) {
          formattedHistory.shift();
        }
      }

      const modelsToTry = [
        'gemini-3.5-flash',
        'gemini-flash-latest',
        'gemini-3.5-flash-lite',
        'gemini-3.1-flash-lite',
      ];
      let replyText = '';

      for (const modelName of modelsToTry) {
        try {
          const model = genAI.getGenerativeModel({
            model: modelName,
            systemInstruction,
          });

          const chat = model.startChat({
            history: formattedHistory,
          });

          const result = await chat.sendMessage(userMessage);
          const response = await result.response;
          replyText = response.text() ? response.text().trim() : '';
          if (replyText) break;
        } catch (err: any) {
          console.warn(`Chat model ${modelName} failed: ${err.message}`);
        }
      }

      if (!replyText) {
        replyText =
          "I'm sorry, I couldn't process that right now. Please try again in a few seconds!";
      }

      // Find matching products mentioned in bot response to render rich cards in UI
      const mentionedProducts = products
        .filter(
          (p: any) =>
            replyText.toLowerCase().includes(p.name.toLowerCase()) ||
            userMessage.toLowerCase().includes(p.category.toLowerCase()),
        )
        .slice(0, 3);

      return {
        success: true,
        reply: replyText,
        recommendedProducts: mentionedProducts,
      };
    } catch (error: any) {
      throw new InternalServerErrorException(
        `AI Chat error: ${error?.message || 'Unable to connect to AI assistant'}`,
      );
    }
  }

  /**
   * 3. Storefront Feature: AI Review Sentiment Summarizer
   */
  async summarizeProductReviews(productId: string) {
    if (!productId) {
      throw new BadRequestException('Product ID is required');
    }

    const cacheKey = `ai_review_summary_${productId}`;
    try {
      const cachedSummary: any = await this.cacheManager.get(cacheKey);
      if (cachedSummary) {
        return cachedSummary;
      }

      const product = await this.productModel
        .findById(productId)
        .select('name reviews')
        .lean();

      if (!product || !product.reviews || product.reviews.length === 0) {
        return {
          success: true,
          summary: null,
          message: 'No customer reviews available yet to summarize.',
        };
      }

      const reviewsText = product.reviews
        .map(
          (r: any, idx: number) =>
            `${idx + 1}. Rating: ${r.rating}/5 ⭐ | Comment: "${r.comment}"`,
        )
        .join('\n');

      const genAI = this.getGenAI();
      const prompt = `You are an expert e-commerce sentiment analyst. Analyze these customer product reviews for "${product.name}":
${reviewsText}

Summarize customer sentiment concisely into key pros and cons.
CRITICAL: Return ONLY a valid raw JSON object matching this schema without any markdown formatting or code blocks:
{
  "overallSummary": "A concise 2-sentence summary of overall customer satisfaction.",
  "pros": ["Highlight 1", "Highlight 2"],
  "cons": ["Critique 1", "Critique 2"]
}`;

      const modelsToTry = [
        'gemini-3.5-flash',
        'gemini-flash-latest',
        'gemini-3.5-flash-lite',
        'gemini-3.1-flash-lite',
      ];
      let jsonText = '';

      for (const modelName of modelsToTry) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent(prompt);
          const response = await result.response;
          jsonText = response.text();
          if (jsonText) {
            jsonText = jsonText
              .replace(/```json/gi, '')
              .replace(/```/g, '')
              .trim();
            break;
          }
        } catch (err: any) {
          console.warn(`Review summary model ${modelName} failed: ${err.message}`);
        }
      }

      let parsedSummary = null;
      if (jsonText) {
        try {
          parsedSummary = JSON.parse(jsonText);
        } catch (parseErr) {
          console.warn('Failed to parse Gemini review JSON summary:', parseErr);
        }
      }

      const resultPayload = {
        success: true,
        summary: parsedSummary,
      };

      if (parsedSummary) {
        await this.cacheManager.set(cacheKey, resultPayload, 3600000); // 1 hour TTL
      }

      return resultPayload;
    } catch (error: any) {
      throw new InternalServerErrorException(
        `AI Review Summary failed: ${error?.message || 'Gemini error'}`,
      );
    }
  }

  /**
   * 4. Storefront Feature: AI Smart Product Recommendations ("Complete the Look")
   */
  async recommendComplementaryProducts(cartItemIds: string[] = []) {
    try {
      if (!Array.isArray(cartItemIds) || cartItemIds.length === 0) {
        return {
          success: true,
          reasoning: '',
          recommendedProducts: [],
        };
      }

      // Fetch items in user cart
      const cartProducts = await this.productModel
        .find({ _id: { $in: cartItemIds } })
        .select('name category price description')
        .lean();

      // Fetch available catalog items excluding items already in cart
      const catalogProducts = await this.productModel
        .find({ _id: { $nin: cartItemIds } })
        .select('name category price description images ratings numOfReviews stock _id')
        .limit(30)
        .lean();

      if (catalogProducts.length === 0) {
        return {
          success: true,
          reasoning: '',
          recommendedProducts: [],
        };
      }

      const cartText = cartProducts
        .map((p) => `- ${p.name} (Category: ${p.category})`)
        .join('\n');

      const catalogText = catalogProducts
        .map(
          (p) =>
            `- ID: ${p._id} | Name: "${p.name}" | Category: ${p.category} | Price: ₹${p.price}`,
        )
        .join('\n');

      const genAI = this.getGenAI();
      const prompt = `You are an expert e-commerce product recommendation engine.
The customer has the following item(s) in their cart:
${cartText}

Here is the rest of our available store inventory catalog:
${catalogText}

STRICT PAIRING RULES:
1. Category Domain Alignment:
   - ELECTRONICS / TECH (Laptops, SmartPhones, Cameras): Recommend ONLY other Tech/Electronics items or accessories (e.g., Phones, Laptops, Headphones, Gadgets). NEVER pair Tech/Laptops/Phones with Shoes, Clothing, Pants, or Apparel!
   - FASHION / APPAREL (Jackets, Shirts, Pants, Footwear): Recommend complementary outfit items (e.g., Jacket -> Pants/Jeans + Shoes; Shirt -> Pants + Footwear).
2. Select 1 to 3 relevant complementary items from the catalog that logically pair with the cart item(s).
3. Write a 1-2 sentence enthusiastic, friendly "Stylist/Tech Tip" explaining why these items pair naturally together.

Return strictly a raw JSON object with NO markdown formatting or code blocks:
{
  "reasoning": "Enthusiastic 1-2 sentence recommendation tip...",
  "recommendedProductIds": ["id1", "id2"]
}`;

      const modelsToTry = [
        'gemini-3.5-flash',
        'gemini-flash-latest',
        'gemini-3.5-flash-lite',
        'gemini-3.1-flash-lite',
      ];
      let jsonText = '';

      for (const modelName of modelsToTry) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent(prompt);
          const response = await result.response;
          jsonText = response.text();
          if (jsonText) {
            jsonText = jsonText
              .replace(/```json/gi, '')
              .replace(/```/g, '')
              .trim();
            break;
          }
        } catch (err: any) {
          console.warn(`Recommend model ${modelName} failed: ${err.message}`);
        }
      }

      let parsedData: { reasoning?: string; recommendedProductIds?: string[] } = {};
      if (jsonText) {
        try {
          parsedData = JSON.parse(jsonText);
        } catch (err) {
          console.warn('Failed to parse Gemini recommendation JSON:', err);
        }
      }

      const recIds = parsedData.recommendedProductIds || [];
      const recommendedProducts = catalogProducts.filter((p: any) =>
        recIds.includes(String(p._id)),
      );

      let finalProducts = recommendedProducts;

      // Smart Domain Fallback if model returned empty or unmatched IDs
      if (finalProducts.length === 0) {
        const cartCategories = cartProducts.map((p) => (p.category || '').toLowerCase());
        const isTechCart = cartCategories.some((c) =>
          ['laptop', 'smartphones', 'camera', 'electronics', 'tech'].some((t) => c.includes(t)),
        );

        if (isTechCart) {
          finalProducts = catalogProducts
            .filter((p) =>
              ['laptop', 'smartphones', 'camera', 'electronics', 'tech'].some((t) =>
                (p.category || '').toLowerCase().includes(t),
              ),
            )
            .slice(0, 3);
        } else {
          finalProducts = catalogProducts
            .filter((p) =>
              ['footwear', 'bottom', 'tops', 'attire', 'clothing', 'fashion'].some((t) =>
                (p.category || '').toLowerCase().includes(t),
              ),
            )
            .slice(0, 3);
        }

        if (finalProducts.length === 0) {
          finalProducts = catalogProducts.slice(0, 3);
        }
      }

      return {
        success: true,
        reasoning: parsedData.reasoning || 'Recommendation: Here are great complementary items to pair with your cart!',
        recommendedProducts: finalProducts,
      };
    } catch (error: any) {
      throw new InternalServerErrorException(
        `AI Recommendation failed: ${error?.message || 'Gemini error'}`,
      );
    }
  }

  /**
   * 5. Storefront Feature: AI Visual Image Search
   */
  async visualImageSearch(base64Image: string) {
    if (!base64Image) {
      throw new BadRequestException('Image data is required for visual search');
    }

    try {
      const mimeMatch = base64Image.match(/^data:(image\/\w+);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
      const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, '');

      const products = await this.productModel
        .find()
        .select('name category price description images ratings numOfReviews stock _id')
        .lean();

      if (products.length === 0) {
        return {
          success: true,
          matchAnalysis: 'No products in store catalog.',
          matchedProducts: [],
        };
      }

      const catalogText = products
        .map(
          (p) =>
            `- ID: ${p._id} | Name: "${p.name}" | Category: ${p.category} | Description: ${p.description ? p.description.slice(0, 100) : ''}`,
        )
        .join('\n');

      const genAI = this.getGenAI();
      const prompt = `You are a multimodal visual search engine for an e-commerce store.
Analyze the attached customer photo carefully.

Compare its visual attributes (object type, color, shape, pattern, style) against our store product catalog:
${catalogText}

TASK:
1. Identify what object/item is in the uploaded photo (e.g. green shirt, running shoes, laptop, smartphone, puffer jacket).
2. Find the product ID(s) in our catalog that match or most closely resemble the item in the photo.

Return strictly a raw JSON object with NO markdown formatting or code blocks:
{
  "matchAnalysis": "Identified a [color] [item type] in the photo.",
  "matchedProductIds": ["id1", "id2"]
}`;

      const imagePart = {
        inlineData: {
          data: cleanBase64,
          mimeType: mimeType,
        },
      };

      const modelsToTry = [
        'gemini-3.5-flash',
        'gemini-flash-latest',
        'gemini-3.5-flash-lite',
        'gemini-3.1-flash-lite',
      ];
      let jsonText = '';

      for (const modelName of modelsToTry) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent([prompt, imagePart]);
          const response = await result.response;
          jsonText = response.text();
          if (jsonText) {
            jsonText = jsonText
              .replace(/```json/gi, '')
              .replace(/```/g, '')
              .trim();
            break;
          }
        } catch (err: any) {
          console.warn(`Visual search model ${modelName} failed: ${err.message}`);
        }
      }

      let parsedData: { matchAnalysis?: string; matchedProductIds?: string[] } = {};
      if (jsonText) {
        try {
          parsedData = JSON.parse(jsonText);
        } catch (err) {
          console.warn('Failed to parse Gemini visual search JSON:', err);
        }
      }

      const matchIds = parsedData.matchedProductIds || [];
      let matchedProducts = products.filter((p: any) =>
        matchIds.includes(String(p._id)),
      );

      // Smart fallback using analysis keywords if direct ID array matching was missed
      if (matchedProducts.length === 0 && parsedData.matchAnalysis) {
        const analysisLower = parsedData.matchAnalysis.toLowerCase();
        matchedProducts = products.filter((p: any) => {
          const nameLower = p.name.toLowerCase();
          const catLower = (p.category || '').toLowerCase();
          return (
            analysisLower.split(' ').some((word) => word.length > 3 && (nameLower.includes(word) || catLower.includes(word)))
          );
        });
      }

      return {
        success: true,
        matchAnalysis: parsedData.matchAnalysis || 'Identified visual attributes matching your photo.',
        matchedProducts: matchedProducts,
      };
    } catch (error: any) {
      throw new InternalServerErrorException(
        `AI Visual Search failed: ${error?.message || 'Gemini error'}`,
      );
    }
  }

  /**
   * 6. Admin Feature: AI Store Intelligence & Executive Analytics
   */
  async getStoreExecutiveInsights() {
    const cacheKey = 'ai_store_executive_insights_v2';
    try {
      const cachedInsights: any = await this.cacheManager.get(cacheKey);
      if (cachedInsights) {
        return cachedInsights;
      }

      const [products, orders, users] = await Promise.all([
        this.productModel.find().lean(),
        this.orderModel.find().lean(),
        this.userModel.find().lean(),
      ]);

      const totalRevenue = orders.reduce((sum, o: any) => sum + (o.totalPrice || 0), 0);
      const outOfStockProducts = products.filter((p: any) => p.stock === 0);
      const lowStockProducts = products.filter((p: any) => p.stock > 0 && p.stock <= 5);

      const categoryCounts: Record<string, number> = {};
      products.forEach((p: any) => {
        const cat = p.category || 'Uncategorized';
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      });

      const orderStatuses: Record<string, number> = {};
      orders.forEach((o: any) => {
        const status = o.orderStatus || 'Processing';
        orderStatuses[status] = (orderStatuses[status] || 0) + 1;
      });

      const storeMetricsContext = `
STORE METRICS SUMMARY:
- Total Revenue: ₹${totalRevenue.toFixed(2)} (Indian Rupees / INR)
- Total Orders: ${orders.length}
- Order Status Breakdown: ${JSON.stringify(orderStatuses)}
- Total Catalog Products: ${products.length}
- Out of Stock Items (${outOfStockProducts.length}): ${outOfStockProducts.map((p: any) => p.name).join(', ') || 'None'}
- Low Stock Items (${lowStockProducts.length}): ${lowStockProducts.map((p: any) => `${p.name} (${p.stock} left)`).join(', ') || 'None'}
- Product Categories: ${JSON.stringify(categoryCounts)}
- Total Registered Customers: ${users.length}
`;

      const genAI = this.getGenAI();
      const prompt = `You are a Chief E-Commerce Executive Advisor & AI Business Analyst for an online store based in India.
Analyze the store metrics below carefully:
${storeMetricsContext}

IMPORTANT: All financial figures, revenue, and prices are strictly in Indian Rupees (₹ / INR). ALWAYS state currency using ₹ or INR (e.g., ₹2.65M, ₹2,65,000, or ₹2.65 Lakhs/Crores). NEVER use dollars ($).

TASK:
Provide a crisp, actionable executive brief for the store administrator.

Return strictly a raw JSON object with NO markdown formatting or code blocks:
{
  "executiveSummary": "2-sentence summary of overall store health, sales trajectory, and inventory state.",
  "inventoryAlerts": [
    "Short 1-sentence warning on low stock or out-of-stock items requiring restock"
  ],
  "strategicRecommendations": [
    "Actionable tip on pricing, inventory restock, or cross-selling opportunities"
  ]
}`;

      const modelsToTry = [
        'gemini-3.5-flash',
        'gemini-flash-latest',
        'gemini-3.5-flash-lite',
      ];

      let jsonText = '';
      for (const modelName of modelsToTry) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent(prompt);
          const response = await result.response;
          jsonText = response.text();
          if (jsonText) {
            jsonText = jsonText.replace(/```json/gi, '').replace(/```/g, '').trim();
            break;
          }
        } catch (err: any) {
          console.warn(`Executive insights model ${modelName} failed: ${err.message}`);
        }
      }

      let parsed: {
        executiveSummary?: string;
        inventoryAlerts?: string[];
        strategicRecommendations?: string[];
      } = {};

      if (jsonText) {
        try {
          parsed = JSON.parse(jsonText);
        } catch (e) {
          console.warn('Failed to parse Gemini Executive Insights JSON:', e);
        }
      }

      const resultPayload = {
        success: true,
        executiveSummary: parsed.executiveSummary || `Your store has generated ₹${totalRevenue.toFixed(2)} across ${orders.length} orders with ${products.length} catalog products.`,
        inventoryAlerts: parsed.inventoryAlerts || (lowStockProducts.length > 0 ? [`Restock notice: ${lowStockProducts.length} products have 5 or fewer items remaining.`] : ['Inventory levels are healthy across all categories.']),
        strategicRecommendations: parsed.strategicRecommendations || ['Consider bundling top-rated items with accessories to boost average order value.'],
      };

      await this.cacheManager.set(cacheKey, resultPayload, 900000); // 15 Minutes TTL

      return resultPayload;
    } catch (error: any) {
      throw new InternalServerErrorException(
        `AI Executive Insights failed: ${error?.message || 'Gemini error'}`,
      );
    }
  }

  /**
   * 7. Admin Feature: AI SEO Meta & Tag Generator
   */
  async generateSeoMetaData(name: string, category?: string, description?: string) {
    if (!name || !name.trim()) {
      throw new BadRequestException('Product name is required to generate SEO metadata');
    }

    try {
      const genAI = this.getGenAI();
      const prompt = `You are a Search Engine Optimization (SEO) & E-Commerce Marketing Expert.
Generate SEO metadata and search keywords for this product:

PRODUCT TITLE: ${name}
CATEGORY: ${category || 'General'}
DESCRIPTION SNIPPET: ${(description || '').replace(/<[^>]*>?/gm, '').slice(0, 300)}

REQUIREMENTS:
1. "metaTitle": A compelling, keyword-rich title for Google Search (Under 60 characters).
2. "metaDescription": An engaging sales snippet for Google search result previews (Under 155 characters).
3. "tags": Array of 5-8 relevant search keywords, synonyms, and category terms (e.g. ["puffer jacket", "winter coat", "men outerwear"]).

Return strictly a raw JSON object with NO markdown formatting or code blocks:
{
  "metaTitle": "SEO Title",
  "metaDescription": "SEO Description",
  "tags": ["keyword1", "keyword2", "keyword3"]
}`;

      const modelsToTry = [
        'gemini-3.5-flash',
        'gemini-flash-latest',
        'gemini-3.5-flash-lite',
      ];

      let jsonText = '';
      for (const modelName of modelsToTry) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent(prompt);
          const response = await result.response;
          jsonText = response.text();
          if (jsonText) {
            jsonText = jsonText.replace(/```json/gi, '').replace(/```/g, '').trim();
            break;
          }
        } catch (err: any) {
          console.warn(`SEO generator model ${modelName} failed: ${err.message}`);
        }
      }

      let parsed: { metaTitle?: string; metaDescription?: string; tags?: string[] } = {};
      if (jsonText) {
        try {
          parsed = JSON.parse(jsonText);
        } catch (e) {
          console.warn('Failed to parse Gemini SEO JSON:', e);
        }
      }

      return {
        success: true,
        metaTitle: parsed.metaTitle || `${name} | ${category || 'Store'}`,
        metaDescription: parsed.metaDescription || `Buy ${name} at the best price online. High quality ${category || 'products'} with fast shipping!`,
        tags: parsed.tags || [name.toLowerCase(), (category || '').toLowerCase()].filter(Boolean),
      };
    } catch (error: any) {
      throw new InternalServerErrorException(
        `AI SEO Generation failed: ${error?.message || 'Gemini error'}`,
      );
    }
  }

  /**
   * 9. Customer Feature: AI Product Q&A Assistant
   */
  async askProductQuestion(productId: string, question: string) {
    if (!productId) {
      throw new BadRequestException('Product ID is required');
    }
    if (!question || !question.trim()) {
      throw new BadRequestException('Question is required');
    }

    try {
      const product = await this.productModel.findById(productId).lean();
      if (!product) {
        throw new BadRequestException('Product not found');
      }

      const reviewsSummary = (product.reviews || [])
        .slice(0, 8)
        .map((r: any) => `User (${r.name}, Rating: ${r.rating}/5): "${r.comment}"`)
        .join('\n');

      const optionsSummary = (product.options || [])
        .map((o: any) => `${o.name}: ${o.values.join(', ')}`)
        .join('; ');

      const productContext = `
PRODUCT DETAILS:
- Name: ${product.name}
- Category: ${product.category}
- Price: ₹${product.price} (Original: ₹${product.originalPrice || product.price})
- Stock Status: ${product.stock > 0 ? `In Stock (${product.stock} units)` : 'Out of Stock'}
- Available Options/Variants: ${optionsSummary || 'Standard'}
- Description: ${product.description.replace(/<[^>]*>?/gm, '')}

CUSTOMER REVIEWS SAMPLE:
${reviewsSummary || 'No customer reviews submitted yet.'}
`;

      const genAI = this.getGenAI();
      const prompt = `You are a helpful, expert Product Specialist & E-Commerce Customer Support Assistant.
A shopper has a specific question about the product below:

${productContext}

CUSTOMER QUESTION: "${question}"

REQUIREMENTS:
1. Provide a helpful, clear, and direct 2-4 sentence answer.
2. Base your response on the product description, specifications, and customer review feedback provided above.
3. If the specific detail isn't explicitly mentioned, state what is known and give reasonable advice (e.g. standard care instructions or warranty recommendations).
4. Be polite, friendly, and helpful to encourage a positive shopping experience.`;

      const modelsToTry = [
        'gemini-3.5-flash',
        'gemini-flash-latest',
        'gemini-3.5-flash-lite',
      ];

      let answerText = '';
      for (const modelName of modelsToTry) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent(prompt);
          const response = await result.response;
          answerText = response.text();
          if (answerText) break;
        } catch (err: any) {
          console.warn(`Product Q&A model ${modelName} failed: ${err.message}`);
        }
      }

      return {
        success: true,
        question: question.trim(),
        answer: answerText || `Regarding ${product.name}: ${product.description.slice(0, 150)}... Please contact support if you need more details.`,
      };
    } catch (error: any) {
      throw new InternalServerErrorException(
        `AI Product Q&A failed: ${error?.message || 'Gemini error'}`,
      );
    }
  }

  /**
   * 10. Storefront Feature: AI Smart Cart Upsell Nudge ("AOV Booster")
   */
  async getCartUpsellNudge(cartItemIds: string[] = [], subtotal: number = 0) {
    const numericSubtotal = Math.max(0, Number(subtotal) || 0);

    // Fetch store settings for shipping threshold
    const activeSettings = (await this.settingsModel.findOne().lean()) || {
      freeShippingThreshold: 1000,
      shippingFee: 200,
      isShippingFeeEnabled: true,
    };

    const threshold = activeSettings.freeShippingThreshold || 1000;
    const isFeeEnabled = activeSettings.isShippingFeeEnabled ?? true;
    const gap = threshold - numericSubtotal;

    const safeCartIds: string[] = Array.isArray(cartItemIds)
      ? cartItemIds
          .map((id: any) => (typeof id === 'string' ? id : String(id?._id || id?.productId || '')))
          .filter((id: string) => typeof id === 'string' && id.length === 24)
      : [];

    // Fetch catalog products excluding current cart items
    let inStockProducts = await this.productModel
      .find({
        _id: { $nin: safeCartIds },
      })
      .select('name price originalPrice category stock images ratings numOfReviews _id')
      .limit(20)
      .lean();

    if (inStockProducts.length === 0) {
      inStockProducts = await this.productModel
        .find()
        .select('name price originalPrice category stock images ratings numOfReviews _id')
        .limit(10)
        .lean();
    }

    if (inStockProducts.length === 0) {
      return {
        success: true,
        qualifiesForFreeShipping: !isFeeEnabled || numericSubtotal >= threshold,
        freeShippingThreshold: threshold,
        gap: Math.max(0, gap),
        nudgeText: numericSubtotal >= threshold ? '🎉 Great news! You qualify for FREE Shipping on this order!' : `You are ₹${Math.max(0, gap)} away from Free Shipping!`,
        suggestedProduct: null,
      };
    }

    const qualifies = !isFeeEnabled || gap <= 0;

    // Fetch cart products to ground Gemini
    const cartProducts = safeCartIds.length > 0
      ? await this.productModel.find({ _id: { $in: safeCartIds } }).select('category name price _id').lean()
      : [];

    const cartSummary = cartProducts.map((p: any) => `- "${p.name}" (Category: ${p.category || 'General'}, Price: ₹${p.price})`).join('\n') || 'None';

    const candidateList = inStockProducts
      .slice(0, 15)
      .map((p: any) => `- ID: ${p._id} | Name: "${p.name}" | Category: ${p.category || 'General'} | Price: ₹${p.price}`)
      .join('\n');

    // Smart fallback product closest to price gap
    const sortedByPrice = [...inStockProducts].sort((a: any, b: any) => {
      const diffA = Math.abs((a.price || 0) - gap);
      const diffB = Math.abs((b.price || 0) - gap);
      return diffA - diffB;
    });
    const defaultSuggestedProduct = sortedByPrice[0] || inStockProducts[0];

    // Generate AI Product Selection & Nudge Text via Gemini
    try {
      const genAI = this.getGenAI();
      const prompt = `You are a Chief AI Merchandising Strategist & E-Commerce Sales Coach for an online store in India.

SHOPPER'S CURRENT CART:
${cartSummary}
Current Cart Subtotal: ₹${numericSubtotal}
Free Shipping Threshold: ₹${threshold}
Status: ${qualifies ? 'QUALIFIED for Free Shipping' : `NEEDS ₹${gap} MORE for Free Shipping`}

STORE IN-STOCK CANDIDATE PRODUCTS:
${candidateList}

TASK:
1. Analyze the items in the cart to determine the shopper's style/domain (e.g. clothing, electronics, footwear, etc.).
2. Pick the SINGLE BEST add-on product from the candidate list that:
   - Is domain/style complementary to what is in their cart (e.g. if clothing in cart, pick clothing/accessory; if tech, pick tech accessory).
   - Has a reasonable price (ideally near ₹${gap}, not an absurdly expensive ₹50,000 item when gap is small).
3. Create a short, highly engaging 1-sentence sales nudge encouraging the shopper in Indian Rupees (₹ / INR).

Return strictly a raw JSON object with NO markdown formatting or code blocks:
{
  "selectedProductId": "exact_ID_from_candidate_list",
  "nudgeText": "✨ 1-sentence sales nudge"
}`;

      const modelsToTry = [
        'gemini-2.5-flash',
        'gemini-1.5-flash',
        'gemini-flash-latest',
        'gemini-1.5-flash-lite',
      ];
      let jsonText = '';

      for (const modelName of modelsToTry) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent(prompt);
          const response = await result.response;
          jsonText = response.text() ? response.text().trim() : '';
          if (jsonText) {
            jsonText = jsonText.replace(/```json/gi, '').replace(/```/g, '').trim();
            break;
          }
        } catch (err: any) {
          console.warn(`Upsell nudge model ${modelName} failed: ${err.message}`);
        }
      }

      let parsed: { selectedProductId?: string; nudgeText?: string } = {};
      if (jsonText) {
        try {
          parsed = JSON.parse(jsonText);
        } catch (e) {
          console.warn('Failed to parse Gemini Upsell Nudge JSON:', e);
        }
      }

      const aiSelectedProd = inStockProducts.find(
        (p: any) => String(p._id) === String(parsed.selectedProductId),
      );
      const finalSuggestedProduct = aiSelectedProd || defaultSuggestedProduct;

      const defaultNudgeText = qualifies
        ? `🎉 Awesome! You unlocked FREE Shipping! Add ${finalSuggestedProduct.name} for ₹${finalSuggestedProduct.price} to complete your order!`
        : `✨ You are only ₹${gap} away from FREE Shipping! Add ${finalSuggestedProduct.name} (₹${finalSuggestedProduct.price}) to qualify!`;

      return {
        success: true,
        qualifiesForFreeShipping: qualifies,
        freeShippingThreshold: threshold,
        gap: Math.max(0, gap),
        nudgeText: parsed.nudgeText || defaultNudgeText,
        suggestedProduct: finalSuggestedProduct,
      };
    } catch (error: any) {
      return {
        success: true,
        qualifiesForFreeShipping: qualifies,
        freeShippingThreshold: threshold,
        gap: Math.max(0, gap),
        nudgeText: qualifies
          ? `🎉 You qualify for FREE Shipping on this order!`
          : `✨ Add ₹${gap} more to your cart to get FREE Shipping!`,
        suggestedProduct: defaultSuggestedProduct,
      };
    }
  }
}
