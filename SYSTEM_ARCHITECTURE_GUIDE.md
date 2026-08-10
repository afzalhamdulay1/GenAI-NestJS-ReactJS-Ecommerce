# 📚 Comprehensive System Architecture & Technical Implementation Guide

This document serves as the authoritative technical reference for the NestJS + React E-Commerce platform. It explains the libraries, frameworks, architectural patterns, and exact technical implementation strategies used for **AI Features**, **Commerce Engine & Guest Checkout**, **Coupons & Discounts**, **Real-Time WebSockets**, **Caching**, **Rate Limiting**, and **Authentication**.

---

## 🛠️ Core Tech Stack & Libraries Used

### Backend Framework & Libraries (NestJS)
- **Framework:** NestJS (Node.js TypeScript framework)
- **Database / ODM:** MongoDB & Mongoose (`@nestjs/mongoose`, `mongoose`)
- **AI SDK:** `@google/generative-ai` (Official Google Gemini Generative AI SDK)
- **Real-Time WebSockets:** Socket.io (`@nestjs/websockets`, `@nestjs/platform-socket.io`, `socket.io`)
- **Authentication:** Passport.js (`@nestjs/passport`, `passport-jwt`, `passport-google-oauth20`, `jsonwebtoken`)
- **Caching:** `@nestjs/cache-manager` (`cache-manager`)
- **Rate Limiting:** `@nestjs/throttler` (IP-based API Throttling)
- **File Uploads:** `multer` (`@types/multer`) for Visual Image Search uploads
- **Environment & Config:** `@nestjs/config` (`dotenv`)

### Frontend Framework & Libraries (React)
- **Framework & Build Tool:** React 18 + TypeScript + Vite (`@vitejs/plugin-react`)
- **State Management:** Redux Toolkit (`@reduxjs/toolkit`, `react-redux`)
- **UI Component Library:** Material UI (`@mui/material`, `@mui/icons-material`, `@emotion/react`)
- **HTTP Client:** Axios (`axios`) with centralized base instance in `@/services/api`
- **Real-Time Client:** `socket.io-client` for Live Support Chat & Order Notifications
- **Rich Text Editor:** CKEditor 5 (`@ckeditor/ckeditor5-react`, `@ckeditor/ckeditor5-build-classic`)
- **Toast Notifications:** `react-toastify`

---

## 🔐 1. Authentication & Security Engine

- **JWT Email / Password Auth:** Secure password hashing (bcrypt) with signed JWT bearer tokens for customer and admin session authorization.
- **Google OAuth 2.0 Integration:** Social single sign-on powered by Passport Google Strategy (`passport-google-oauth20`), allowing shoppers to register and login with 1 click using their Google Accounts.

---

## 💳 2. Commerce Engine, Guest Checkout & Discounts

### 1. Guest Ordering & Secure Access Tokens
- **Frictionless Guest Checkout:** Shoppers can place orders without creating a registered account.
- **Tokenized Tracking & Self-Cancellation:** Generates unique, secure access tokens (`/order/guest/:token`) enabling guest shoppers to track live shipping updates and self-cancel pending orders safely without logging in.

### 2. Automated Refund & Return Processing
- **Order Cancellation Refunds:** Automatically updates payment status to `Refunded` and adjusts stock inventory when an order is cancelled before shipping.
- **Product Return Workflow:** Admin drawer for inspecting customer return requests, approving refunds, and issuing balance restores.

### 3. Product Variant Matrix
- **Variant Attributes:** Multi-dimensional variant matrix support (Size, Color, Option combinations).
- **Variant Controls:** Independent pricing, original prices, images, and stock inventory levels per variant subdocument.

### 4. Standalone Coupon System vs Product Discount Engine
- **Promo Coupon System:** Managed via `CouponsService`, supporting promo codes (e.g. `WELCOME10`), flat vs percentage discounts, minimum cart subtotal thresholds, expiration dates, and usage caps.
- **Product & Variant Discount Engine:** Displays strikethrough original prices vs active sale prices at both the base product level and individual variant level.

---

## 🤖 3. Built-In 9-Feature Gemini AI Suite

### General AI Grounding & Failover Architecture
All AI capabilities are centralized in `src/ai/ai.service.ts` and exposed via REST APIs in `src/ai/ai.controller.ts`.
- **Data Grounding:** Injects live MongoDB context (products, prices, stock levels, variants, reviews, orders) into Gemini prompt strings.
- **Resilience Failover Chain:** Retries sequential Gemini endpoints on quota/busy errors: `gemini-2.5-flash` ➔ `gemini-1.5-flash` ➔ `gemini-flash-latest` ➔ `gemini-1.5-flash-lite`.

#### 1. 💬 AI Shopping Assistant & Customer Support Chatbot ("Afzal AI")
- **Backend:** `POST /api/v1/ai/chat` (`AiService.chatWithShoppingAssistant`)
- **Frontend:** `AIChatWidget.tsx`
- **Details:** Passes customer message history and live MongoDB catalog context to Gemini. Enforces INR (₹) formatting and urgency rules (concealing exact numbers for high stock > 5, revealing exact numbers for low stock $\le 5$). Includes auto-focus input handling so cursor stays in the text box after AI replies.

#### 2. ✨ Admin AI Product Description Generator
- **Backend:** `POST /api/v1/ai/generate-description` (`AiService.generateProductDescription`)
- **Frontend:** `ProductForm.tsx` (CKEditor 5)
- **Details:** Prompts Gemini to generate HTML formatted with `<p>`, `<ul>`, and `<li>` tags describing key product features, auto-filling the admin rich-text editor.

#### 3. 📊 AI Review Sentiment Summarizer
- **Backend:** `GET /api/v1/ai/summarize-reviews/:productId` (`AiService.summarizeProductReviews`)
- **Frontend:** `AIReviewInsights.tsx`
- **Details:** Aggregates customer review texts and star ratings for a product, instructing Gemini to return a structured JSON object containing Overall Sentiment, Key Highlights (Pros), and Points to Note (Cons).

#### 4. 🎯 AI Smart Product Recommendations ("Complete the Look")
- **Backend:** `POST /api/v1/ai/recommend-complementary` (`AiService.recommendComplementaryProducts`)
- **Frontend:** `AISmartRecommendations.tsx`
- **Details:** Analyzes items currently in cart, evaluates domain pairing rules (clothing $\rightarrow$ outfit accessories, tech $\rightarrow$ electronics accessories), and returns matching complementary catalog product cards.

#### 5. 📸 AI Visual Image Search (Multimodal Vision API)
- **Backend:** `POST /api/v1/ai/visual-search` (`AiService.visualSearch`) using `FileInterceptor('image')`
- **Frontend:** `PredictiveSearch.tsx` & `Products.tsx`
- **Details:** Converts uploaded image buffer into base64 inline data and sends it to Gemini Multimodal Vision API to identify category, color, and features, performing weighted text-search matching against MongoDB `ProductTextIndex`.

#### 6. 📈 Admin AI Store Intelligence & Executive Brief
- **Backend:** `GET /api/v1/ai/store-insights` (`AiService.getExecutiveStoreBrief`)
- **Frontend:** `AIExecutiveBriefCard.tsx`
- **Details:** Aggregates total revenue, order counts, low stock counts, and new user registrations. Passes metrics to Gemini to produce an executive store health brief (Cached for 5 minutes).

#### 7. 🏷️ Admin AI SEO Meta & Tag Generator
- **Backend:** `POST /api/v1/ai/generate-seo` (`AiService.generateSeoMetaData`)
- **Frontend:** `ProductForm.tsx` & `<MetaData />`
- **Details:** Uses Gemini to craft search-optimized Google Meta Titles, Meta Descriptions, and Search Tags, saving them in MongoDB `Product` schema and dynamically injecting them into storefront HTML `<head>`.

#### 8. 💬 AI Product Q&A Assistant
- **Backend:** `POST /api/v1/ai/product-qa` (`AiService.askProductQuestion`)
- **Frontend:** `AIProductQASection.tsx`
- **Details:** Combines product specifications, description, variant matrix, and customer reviews into Gemini prompt context to answer pre-purchase shopper questions instantly.

#### 9. 🛍️ AI Smart Cart Upsell Nudge ("AOV Booster")
- **Backend:** `POST /api/v1/ai/cart-upsell-nudge` (`AiService.getCartUpsellNudge`)
- **Frontend:** `AICartUpsellNudge.tsx`
- **Details:** Evaluates subtotal against dynamic `freeShippingThreshold` from `Settings` schema (default: ₹1,000). Uses Gemini to select the best domain-matched add-on item near the price gap and renders a **⚡ 1-Click Add to Cart** card, automatically hiding recommendations once 100% Free Shipping criteria is unlocked.

---

## 📡 4. Real-Time WebSockets Architecture

- **Library:** Socket.io (`@nestjs/websockets`, `socket.io-client`)
- **Backend Gateway:** `src/events/events.gateway.ts` annotated with `@WebSocketGateway({ cors: { origin: '*' } })`

### 1. 💬 Real-Time Live Support Chat
- Connects customer chat widgets (`AIChatWidget.tsx`) directly to Admin Support drawers (`AdminSupportChat.tsx`).
- Broadcasts `support_room_joined` and message events across Socket rooms with smooth DOM auto-scrolling (`scrollTo({ top: scrollHeight, behavior: "smooth" })`).

### 2. 🔔 Instant Admin Order Notifications
- When a customer completes a checkout, NestJS emits a real-time WebSocket event (`new_order_placed`).
- The Admin Dashboard receives the event instantly and pops up a live notification toast, allowing admins to track incoming sales without manual browser refreshes.

---

## ⚡ 5. Caching & Performance Optimization

- **Library:** `@nestjs/cache-manager` (`cache-manager`)
- **Implementation:** Integrated into `AiModule` and injected via `@Inject(CACHE_MANAGER) private cacheManager: Cache`.
- **Executive Analytics Key:** Stores the generated executive brief under key `ai_store_executive_insights_v2` with a 300,000 ms (5-minute) TTL.
- **Benefit:** Eliminates redundant database aggregations and Gemini API token costs on consecutive admin visits.

---

## 🛡️ 6. Rate Limiting & Security (Throttling)

- **Library:** `@nestjs/throttler` (`ThrottlerModule`, `@Throttle()`)
- **Implementation:** Registered globally in `app.module.ts` using `APP_GUARD`.
- **Endpoint Caps:**
  - `@Post('chat')`: Max 10 requests / 60 seconds per IP.
  - `@Post('product-qa')`: Max 8 requests / 60 seconds per IP.
  - `@Post('cart-upsell-nudge')`: Max 15 requests / 60 seconds per IP.
- **Benefit:** Protects public AI APIs from spam, automated bot abuse, DDoS attacks, and Gemini API token overages by automatically returning HTTP `429 Too Many Requests`.

---

## 📁 7. File Mapping Reference Table

| Feature / System | Backend Implementation File | Frontend Implementation File | Key Libraries / Modules |
| :--- | :--- | :--- | :--- |
| **Authentication & OAuth** | `src/auth/` | `LoginSignup.tsx` | Passport.js, Google OAuth 2.0, JWT |
| **Guest Checkout & Refunds** | `src/orders/` | `OrderDetails.tsx`, `ConfirmOrder.tsx` | Mongoose, Tokenized Access Links |
| **Coupons Engine** | `src/coupons/` | `CouponsList.tsx`, `NewCoupon.tsx` | NestJS, Mongoose |
| **Variant Matrix & Discounts**| `src/products/` | `ProductForm.tsx`, `ProductDetails.tsx` | Mongoose Subdocuments |
| **WebSockets (Chat & Order Push)**| `src/events/events.gateway.ts` | `AIChatWidget.tsx`, `AdminSupportChat.tsx` | `@nestjs/websockets`, `socket.io` |
| **AI Module & Controller** | [ai.module.ts](file:///c:/Users/User/Documents/afzal/nestjs-ecom-backend/src/ai/ai.module.ts), [ai.controller.ts](file:///c:/Users/User/Documents/afzal/nestjs-ecom-backend/src/ai/ai.controller.ts) | N/A | `@google/generative-ai`, `@nestjs/throttler` |
| **AI Service (Core Logic)** | [ai.service.ts](file:///c:/Users/User/Documents/afzal/nestjs-ecom-backend/src/ai/ai.service.ts) | N/A | `@google/generative-ai`, `@nestjs/cache-manager` |
| **AI Support Chatbot** | `POST /api/v1/ai/chat` | [AIChatWidget.tsx](file:///c:/Users/User/Documents/afzal/nestjs-ecom-backend/frontend/src/components/AIChat/AIChatWidget.tsx) | `@google/generative-ai`, Redux Toolkit, MUI |
| **AI Description Generator** | `POST /api/v1/ai/generate-description` | [ProductForm.tsx](file:///c:/Users/User/Documents/afzal/nestjs-ecom-backend/frontend/src/components/Admin/ProductForm.tsx) | CKEditor 5, React Hook Form, Zod |
| **AI Review Summarizer** | `GET /api/v1/ai/summarize-reviews/:id` | [AIReviewInsights.tsx](file:///c:/Users/User/Documents/afzal/nestjs-ecom-backend/frontend/src/components/Product/Sections/AIReviewInsights.tsx) | `@google/generative-ai`, MUI |
| **AI Stylist Recommendations** | `POST /api/v1/ai/recommend-complementary` | [AISmartRecommendations.tsx](file:///c:/Users/User/Documents/afzal/nestjs-ecom-backend/frontend/src/components/Cart/Sections/AISmartRecommendations.tsx) | `@google/generative-ai`, Redux Toolkit |
| **AI Visual Image Search** | `POST /api/v1/ai/visual-search` | [PredictiveSearch.tsx](file:///c:/Users/User/Documents/afzal/nestjs-ecom-backend/frontend/src/components/Header/PredictiveSearch.tsx) | `@google/generative-ai` (Vision API), `multer` |
| **AI Executive Store Brief** | `GET /api/v1/ai/store-insights` | [AIExecutiveBriefCard.tsx](file:///c:/Users/User/Documents/afzal/nestjs-ecom-backend/frontend/src/components/Admin/Sections/AIExecutiveBriefCard.tsx) | `@nestjs/cache-manager`, `@google/generative-ai` |
| **AI SEO Meta Generator** | `POST /api/v1/ai/generate-seo` | [ProductForm.tsx](file:///c:/Users/User/Documents/afzal/nestjs-ecom-backend/frontend/src/components/Admin/ProductForm.tsx) | `@google/generative-ai`, MongoDB Text Index |
| **AI Product Q&A** | `POST /api/v1/ai/product-qa` | [AIProductQASection.tsx](file:///c:/Users/User/Documents/afzal/nestjs-ecom-backend/frontend/src/components/Product/Sections/AIProductQASection.tsx) | `@google/generative-ai`, `@nestjs/throttler` |
| **AI Cart Upsell Nudge** | `POST /api/v1/ai/cart-upsell-nudge` | [AICartUpsellNudge.tsx](file:///c:/Users/User/Documents/afzal/nestjs-ecom-backend/frontend/src/components/Cart/Sections/AICartUpsellNudge.tsx) | `@google/generative-ai`, Redux Toolkit |

---
*Generated for Afzal E-Commerce Platform — System Architecture & Technical Implementation Guide.*
