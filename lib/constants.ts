export const APP_NAME        = "GrocerApp";
export const APP_DESCRIPTION = "Fresh groceries delivered to your door";

export const ORDER_STATUSES = ["PENDING", "PROCESSING", "DELIVERED", "CANCELLED"] as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING:    "Pending",
  PROCESSING: "Processing",
  DELIVERED:  "Delivered",
  CANCELLED:  "Cancelled",
};

export const ROUTES = {
  HOME:               "/",
  LOGIN:              "/login",
  SIGNUP:             "/signup",
  CART:               "/cart",
  CHECKOUT:           "/checkout",
  ORDERS:             "/orders",
  ADMIN:              "/admin",
  ADMIN_PRODUCTS:     "/admin/products",
  ADMIN_PRODUCTS_NEW: "/admin/products/new",
  ADMIN_ORDERS:       "/admin/orders",
} as const;
