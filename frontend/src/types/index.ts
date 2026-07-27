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
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  ratings: number;
  images: ProductImage[];
  category: string;
  stock: number;
  numOfReviews: number;
  reviews?: Review[];
  user?: string;
  createdAt?: string;
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
  deliveredAt?: string;
  createdAt: string;
  user: string | UserObject;
}

export interface CartItem {
  productId: string;
  product?: string;
  name: string;
  price: number;
  image: string;
  stock: number;
  quantity: number;
}
