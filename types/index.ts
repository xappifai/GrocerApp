// ─── Auth ────────────────────────────────────────────────────────────────────

export type UserRole = "ADMIN" | "CLIENT";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface UserProfile {
  name: string;
  phone: string;
  address: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
}

export interface AuthTokens {
  accessToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  name: string;
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// ─── Category ────────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
}

// ─── Product ─────────────────────────────────────────────────────────────────

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  stock: number;
  categoryId: string;
  category: Category;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductInput {
  name: string;
  description: string;
  price: number;
  image: string;
  stock: number;
  categoryId: string;
}

export interface UpdateProductInput extends Partial<CreateProductInput> {}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export interface CartItem {
  product: Product;
  quantity: number;
}

// ─── Order ───────────────────────────────────────────────────────────────────

export type OrderStatus = "PENDING" | "PROCESSING" | "DELIVERED";

export interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  status: OrderStatus;
  totalPrice: number;
  userId: string;
  user: User;
  items: OrderItem[];
  deliveryAddress: string;
  deliveryCity: string;
  deliveryPhone: string;
  deliveryLatitude?: number | null;
  deliveryLongitude?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderInput {
  items: { productId: string; quantity: number }[];
  deliveryAddress: string;
  deliveryCity: string;
  deliveryPhone: string;
  deliveryLatitude?: number | null;
  deliveryLongitude?: number | null;
}

// ─── API ─────────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
}

// ─── UI ──────────────────────────────────────────────────────────────────────

export interface SelectOption {
  label: string;
  value: string;
}

export type ToastType = "success" | "error" | "info";

// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalCustomers: number;
  pendingOrders: number;
  recentOrders: Order[];
}
