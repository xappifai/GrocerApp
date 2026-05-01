// Mock data replaced by Supabase — see supabase/schema.sql for seed data.
import type { Category, Product, Order, DashboardStats } from "@/types";

export const mockCategories: Category[]   = [];
export const mockProducts:   Product[]    = [];
export const mockOrders:     Order[]      = [];
export const mockDashboardStats: DashboardStats = {
  totalOrders:    0,
  totalRevenue:   0,
  totalProducts:  0,
  totalCustomers: 0,
  pendingOrders:  0,
  recentOrders:   [],
};
