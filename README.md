# 🛍️ NestJS E-Commerce REST API

A highly scalable, production-ready E-Commerce REST API built with NestJS and MongoDB, featuring Role-Based Access Control (RBAC), secure payment gateway integration, and comprehensive admin panel support. 

This backend was built to power modern frontend frameworks (React, Next.js, Vue) and ensures enterprise-grade security, type safety, and strict data validation.

---

## ✨ Key Features

### 🛡️ Authentication & Authorization
- **JWT Authentication:** Secure user login and registration using JSON Web Tokens stored securely in cookies.
- **Role-Based Access Control (RBAC):** Custom Guard architecture to restrict access. Normal users can only access their data, while `admin` users gain access to comprehensive dashboard endpoints.

### 📦 Product & Order Management
- **Full CRUD for Products:** Create, read, update, and delete products with multiple images, pricing, stock, and categories.
- **Reviews & Ratings:** Users can leave reviews and ratings, with automated recalculation of overall product ratings.
- **Order Processing:** Complete order lifecycle management (processing, shipped, delivered) with stock deduction logic.

### 💳 Payments
- **Stripe Integration:** Secure server-side Stripe integration to generate payment intents and process credit card transactions.

### ⚙️ Architecture & Security
- **Strict Validation:** Every endpoint is protected by `ValidationPipe`, utilizing `class-validator` and `class-transformer` to strictly enforce DTO structures and prevent rogue data injections.
- **Global Exception Filtering:** Custom filters dynamically catch unhandled exceptions (like Mongoose duplicate keys or JWT expirations) and format them into clean, human-readable JSON.
- **Stateless Media Uploads:** Native integration with Cloudinary utilizing Multer to parse large Base64 image payloads seamlessly.

---

## 🛠️ Technology Stack

- **Framework:** [NestJS](https://nestjs.com/) (Node.js)
- **Language:** TypeScript
- **Database:** MongoDB & Mongoose
- **Authentication:** bcryptjs, jsonwebtoken, cookie-parser
- **Storage:** Cloudinary
- **Payments:** Stripe

---

## 🚀 Getting Started

Follow these instructions to run the project locally.

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd nestjs-ecom-backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory and configure the following variables:

```env
PORT=4000
DB_URI=mongodb://localhost:27017/Ecommerce
FRONTEND_URL=http://localhost:3000

# Authentication
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=5d
COOKIE_EXPIRE=5

# Stripe Payments
STRIPE_API_KEY=your_stripe_public_key
STRIPE_SECRET_KEY=your_stripe_secret_key

# Cloudinary
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 4. Run the Application

**Development Mode:**
```bash
npm run start:dev
```

**Production Build:**
```bash
npm run build
npm run start:prod
```

The API will be available at `http://localhost:4000/api/v1`.

---

## 📝 API Endpoints Summary

- **Auth:** `/api/v1/register`, `/api/v1/login`, `/api/v1/logout`, `/api/v1/password/forgot`
- **User:** `/api/v1/me`, `/api/v1/me/update`
- **Products:** `/api/v1/products`, `/api/v1/product/:id`, `/api/v1/review`
- **Orders:** `/api/v1/order/new`, `/api/v1/order/:id`, `/api/v1/orders/me`
- **Payments:** `/api/v1/payment/process`, `/api/v1/stripeapikey`
- **Admin (RBAC Protected):**
  - `/api/v1/admin/users`
  - `/api/v1/admin/product/new`
  - `/api/v1/admin/orders`
