// User & Authentication
export interface User {
  id: string;
  email: string;
  password: string;
  role: "admin" | "staff" | "cashier" | "customer";
  name: string;
  createdAt: Date;
}

// Products & Categories
export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  rating?: number;
  reviews?: number;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
  category?: Category;
}

// Cart & Orders
export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product?: Product;
  quantity: number;
  price: number;
}

export type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Preparing"
  | "Out for Delivery"
  | "Delivered"
  | "Cancelled";
export type PaymentMethod = "Cash on Delivery" | "GCash" | "Maya";
export type PaymentStatus = "Pending" | "Verified" | "Rejected";
export type DeliveryType = "Pickup" | "Delivery";

export interface Order {
  id: string;
  customerId: string;
  customer?: Customer;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  deliveryType: DeliveryType;
  deliveryDate?: Date | string;
  deliveryTime?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Customers
export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  address: string;
  landmark?: string;
  latitude?: number | null;
  longitude?: number | null;
  totalOrders: number;
  createdAt: Date;
}

// Payments
export interface Payment {
  id: string;
  orderId: string;
  order?: Order;
  method: PaymentMethod;
  receipt?: string;
  referenceNumber?: string;
  amount: number;
  status: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Promos
export interface Promo {
  id: string;
  code: string;
  discount: number;
  discountType: "fixed" | "percentage";
  expiryDate: Date;
  maxUses?: number;
  currentUses: number;
  active: boolean;
  createdAt: Date;
}

// Reports
export interface SalesReport {
  date: Date;
  totalSales: number;
  orderCount: number;
  averageOrderValue: number;
}

export interface BestSellerReport {
  productId: string;
  productName: string;
  totalQuantitySold: number;
  totalRevenue: number;
}

// Settings
export interface BusinessSettings {
  businessName: string;
  logo?: string;
  contactNumber: string;
  facebook?: string;
  instagram?: string;
  address: string;
  gcashQR?: string;
  mayaQR?: string;
  bankAccount?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
