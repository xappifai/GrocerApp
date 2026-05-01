export const APP_NAME = "GrocerApp";
export const APP_DESCRIPTION = "Fresh groceries delivered to your door";

export const TOKEN_KEY = "grocer_token";
export const USER_KEY = "grocer_user";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export const ORDER_STATUSES = ["PENDING", "PROCESSING", "DELIVERED"] as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  DELIVERED: "Delivered",
};

export const ITEMS_PER_PAGE = 10;

export const DEFAULT_CATEGORIES = [
  { id: "all", name: "All", slug: "all" },
  { id: "1", name: "Fruits & Vegetables", slug: "fruits-vegetables" },
  { id: "2", name: "Dairy & Eggs", slug: "dairy-eggs" },
  { id: "3", name: "Meat & Seafood", slug: "meat-seafood" },
  { id: "4", name: "Bakery", slug: "bakery" },
  { id: "5", name: "Beverages", slug: "beverages" },
  { id: "6", name: "Snacks", slug: "snacks" },
  { id: "7", name: "Pantry", slug: "pantry" },
];

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  CART: "/cart",
  CHECKOUT: "/checkout",
  ORDERS: "/orders",
  ADMIN: "/admin",
  ADMIN_PRODUCTS: "/admin/products",
  ADMIN_PRODUCTS_NEW: "/admin/products/new",
  ADMIN_ORDERS: "/admin/orders",
} as const;
