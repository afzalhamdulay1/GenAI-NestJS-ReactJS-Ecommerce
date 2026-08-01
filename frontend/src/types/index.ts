export interface UserAvatar {
  public_id: string;
  url: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: UserAvatar;
  createdAt?: string;
  updatedAt?: string;
  googleId?: string;
  wishlist?: Product[] | string[];
}

export interface ProductImage {
  public_id: string;
  url: string;
}

export interface Review {
  _id: string;
  user: string;
  name: string;
  rating: number;
  comment: string;
  photos?: ProductImage[];
  isVerifiedPurchase?: boolean;
  createdAt?: string;
}

export interface ProductOption {
  name: string;
  values: string[];
}

export interface ProductVariant {
  attributes: Record<string, string>;
  stock: number;
  price?: number;
  originalPrice?: number;
  sku?: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discountType?: 'percentage' | 'fixed';
  ratings: number;
  images: ProductImage[];
  category: string;
  stock: number;
  numOfReviews: number;
  reviews?: Review[];
  user?: string;
  createdAt?: string;
  hasVariants?: boolean;
  options?: ProductOption[];
  variants?: ProductVariant[];
}

export interface PaymentInfo {
  id: string;
  status: string;
}

export interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  image: string;
  product: string;
  productId?: string;
  selectedVariant?: Record<string, string>;
}

export interface UserObject {
  _id: string;
  name: string;
  email: string;
}

export interface ShippingInfo {
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pinCode?: string | number;
  phoneNo?: string | number;
}

export interface TrackingInfo {
  courierName?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  shippedAt?: string;
  estimatedDelivery?: string;
}

export interface Order {
  _id: string;
  shippingInfo: ShippingInfo;
  orderItems: OrderItem[];
  paymentInfo: PaymentInfo;
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  orderStatus: string;
  trackingInfo?: TrackingInfo;
  deliveredAt?: string;
  createdAt: string;
  user?: string | UserObject;
  guestName?: string;
  guestEmail?: string;
  guestAccessToken?: string;
  isGuest?: boolean;
}

export interface CartItem {
  productId: string;
  product?: string;
  name: string;
  price: number;
  image: string;
  stock: number;
  quantity: number;
  selectedVariant?: Record<string, string>;
}
