# 🛍️ Enterprise NestJS E-Commerce Stack

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Stripe](https://img.shields.io/badge/Stripe-625DF5?style=for-the-badge&logo=stripe&logoColor=white)](https://stripe.com/)
[![Passport](https://img.shields.io/badge/Passport-34E27A?style=for-the-badge&logo=passport&logoColor=white)](http://www.passportjs.org/)
[![Zod](https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white)](https://zod.dev/)

A highly scalable, production-ready Full-Stack E-Commerce platform. This application features a unified architecture where the robust **NestJS + TypeScript** backend directly serves the modern **React + Vite** frontend. It includes native Google OAuth, secure Stripe checkout, advanced type-safe forms, and role-based administration features.

🔗 **Live Demo:** [https://nestjs-reactjs-ecommerce.onrender.com/](https://nestjs-reactjs-ecommerce.onrender.com/)

---

## ⚡ Unified Full-Stack Architecture

Rather than maintaining separate hosting environments, this repository runs as a single unified service:

- **Development:** Vite's dev server proxies API requests seamlessly to the NestJS backend.
- **Production:** NestJS serves the compiled React production assets (`/frontend/dist`) statically. All client-side routing (React Router) falls back to `index.html` automatically, while API routes are protected under `/api/v1/*`.

---

## ✨ Key Features

### 🏷️ Dynamic Category Management Suite

- **Admin Category CRUD & Deletion Safety:** Dedicated Admin Categories management dashboard (`/admin/categories` and `/admin/category/new`) with real-time assigned product counters (`productsCount`). Prevents category deletion if active products are assigned to it.
- **Dynamic Catalog Feeds:** All product forms (Add/Edit Product) and store catalog filter feeds fetch live category options dynamically from backend REST endpoints with guaranteed fallback options (`Other`).

### 🎟️ Promotional Coupon & Discount Engine

- **Full Coupon Management (`CouponsModule`):** End-to-end admin management of promotional discount codes (`/admin/coupons` and `/admin/coupon/new`) supporting percentage discounts, maximum discount caps, minimum order thresholds, and expiration dates.
- **Real-Time Checkout Validation:** Automated validation and instant discount calculation on the checkout shipping page.

### 🏪 Store Settings Engine

- **Global Store Configuration (`SettingsModule`):** Admin endpoint to dynamically update store-wide parameters like standard tax rates, shipping charges, free shipping thresholds, and currency formatting.

### 🛡️ Authentication & Google OAuth 2.0

- **Google Sign-In & Sign-Up:** Complete Google login using Passport OAuth 2.0 strategy.
- **Auto Account Merging:** Google login automatically links with existing email/password accounts if emails match.
- **Smart Route Guards:** Custom `GoogleAuthGuard` detects login cancellations or failures and redirects users back to `/login` rather than exposing raw JSON error pages.
- **Secure JWT Sessions:** Encrypted JWT tokens stored in HTTP-Only cookies to protect against XSS/CSRF.

### 📐 Robust Frontend Architecture

- **Strict Type-Safe Forms:** 100% of the application's forms (Authentication, Cart, and Admin Dashboard) are powered by **React Hook Form** + **Zod** schema validation, ensuring zero unnecessary re-renders and guaranteeing mathematical type safety before data hits the backend.
- **Searchable Select Controls:** Enhanced `<FormSelect />` component supporting an optional `searchable={true}` prop powered by Material-UI `<Autocomplete />` for smooth search filtering across long lists (e.g. Country & State selectors).
- **Route-Based Code Splitting:** `React.lazy()` and `Suspense` chunk the application down to highly optimized bundles, loading massive third-party packages dynamically only when users visit specific flows (like the Checkout page).

### 📦 Product & Order Engine

- **Automated Cancellations:** Users and Admins can instantly cancel orders, triggering automated email confirmations sent directly via Nodemailer.
- **Smart Inventory Management:** Automated real-time stock deduction upon shipping confirmation (not order creation) and automatic stock restoration if an order is cancelled.
- **Dynamic Reviews:** Automated score recalculation whenever products are reviewed or rated.
- **User Wishlist & Favorites:** Dedicated wishlist management allowing users to save products with heart toggles on product cards and a dedicated `/wishlist` management page.
- **Unified Admin Dashboard:** Full CRUD endpoints to manage users, products, categories, coupons, orders, and reviews with a standardized, breadcrumb-navigation UI header and unified DataGrid styling.

### 💳 Payments & Media Storage

- **Stripe Gateway & Automated Refunds:** Secure server-side Stripe integration to create payment intents. Directly integrates with the Stripe SDK to process instant, automated refunds to the user's card upon order cancellation.
- **Cloudinary Storage:** Media handling using Multer for base64 photo uploads.

### 🧩 Modular UI & Code Separation

- **Reusable Form Components:** Form controls like Inputs and Select dropdowns are abstracted into fully reusable wrapper components (`<FormInput />`, `<FormSelect />`). These wrappers seamlessly bridge Material-UI with React Hook Form, eliminating boilerplate and guaranteeing consistent validation UI everywhere.
- **Reusable Layout Components:** Shared UI elements (like `AdminPageHeader` and custom Dialogs) are abstracted into standalone components to prevent code duplication across pages.
- **Component-Level Styling:** CSS is heavily scoped and separated to individual component stylesheets to prevent global namespace pollution and ensure predictability.
- **Clean File Structure:** Large, monolithic page components are broken down into logical sub-components (e.g. separating sidebars and layout wrappers) to maintain readability and scalability.

### 💡 Code Architecture & Best Practices

- **Domain-Driven Backend:** The NestJS architecture is highly modular (Users, Orders, Products, Auth), utilizing **DTOs (Data Transfer Objects)** for strict payload validation and **Custom Decorators** (like `@CurrentUser`) to keep controllers completely DRY.
- **Global Exception Handling:** Custom Exception Filters catch and format Mongoose/MongoDB errors symmetrically before returning them to the client.
- **Predictable State Management:** The frontend leverages **Redux Toolkit** (Slices) to eliminate Redux boilerplate, keeping global state predictable and easily debuggable.
- **Separation of Concerns:** Deeply nested UI components rely on custom hooks (`useAppSelector`, `useAppDispatch`) rather than excessive prop drilling, keeping the component tree clean and maintainable.

---

## 🛠️ Tech Stack

- **Backend Framework:** NestJS (NodeJS) + TypeScript
- **Frontend Library:** React (Vite) + Tailwind CSS + Redux Toolkit
- **Form & Validation Engine:** React Hook Form + Zod
- **Database:** MongoDB & Mongoose
- **Auth Core:** PassportJS (`passport-jwt`, `passport-google-oauth20`)
- **Styling & Assets:** Vanilla CSS, Material UI (MUI Icons)

---

## 🚀 Getting Started

### 1. Clone & Set Up

```bash
git clone <your-repo-url>
cd nestjs-ecom-backend
npm install
```

### 2. Configure Environment (`.env`)

Create a `.env` file in the root directory:

```env
PORT=4000
DB_URI=mongodb+srv://...
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
COOKIE_EXPIRE=5
FRONTEND_URL=http://localhost:3000

# Stripe Payments
STRIPE_API_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google OAuth Credentials
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:4000/api/v1/auth/google/callback
```

### 3. Run Locally

- **Run Backend (Port 4000):**
  ```bash
  npm run start:dev
  ```
- **Run Frontend (Port 3000):**
  ```bash
  cd frontend
  npm run dev
  ```

---

## 📂 Project Directory Structure

```
nestjs-ecom-backend/
├── frontend/                 # React Frontend Codebase
│   ├── src/                  # React Source files
│   ├── dist/                 # Vite production build output
│   └── package.json
├── src/                      # NestJS Backend Codebase
│   ├── auth/                 # Passport strategies & JWT/Google guards
│   ├── users/                # User Schemas, Services, & Controllers
│   ├── products/             # Product Schemas & Reviews
│   ├── orders/               # Order Schemas & Stock controllers
│   ├── payments/             # Stripe checkout handlers
│   └── main.ts               # Server entry point
├── package.json              # Chained build scripts for unified deployment
└── README.md
```

---

## 📝 API Endpoints Summary

| Method     | Endpoint                       | Description                            | Access         |
| :--------- | :----------------------------- | :------------------------------------- | :------------- |
| **GET**    | `/api/v1/categories`           | Fetch all dynamic store categories     | Public         |
| **GET**    | `/api/v1/auth/google`          | Initiates Google OAuth Login           | Public         |
| **GET**    | `/api/v1/auth/google/callback` | Google OAuth redirect receiver         | Public         |
| **POST**   | `/api/v1/register`             | Register new user account              | Public         |
| **POST**   | `/api/v1/login`                | Login with email & password            | Public         |
| **GET**    | `/api/v1/me`                   | Fetch authenticated profile details    | User           |
| **PUT**    | `/api/v1/me/update`            | Update user profile and avatar         | User           |
| **POST**   | `/api/v1/payment/process`      | Create Stripe Payment intent           | User           |
| **POST**   | `/api/v1/coupons/apply`        | Validate & calculate coupon discount   | User           |
| **PUT**    | `/api/v1/order/:id/cancel`     | Cancel an active 'Processing' order    | User           |
| **GET**    | `/api/v1/admin/users`          | Fetch list of all registered users     | **Admin Only** |
| **POST**   | `/api/v1/admin/category/new`   | Create dynamic product category        | **Admin Only** |
| **POST**   | `/api/v1/admin/coupon/new`     | Create promotional discount coupon     | **Admin Only** |
| **POST**   | `/api/v1/admin/product/new`    | Create new shop product listing        | **Admin Only** |
| **PUT**    | `/api/v1/admin/order/:id`      | Update logistics status (e.g. Shipped) | **Admin Only** |
| **DELETE** | `/api/v1/admin/user/:id`       | Remove user registration               | **Admin Only** |
