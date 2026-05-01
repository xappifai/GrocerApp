import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Package, ShoppingBag } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { mapOrder } from "@/lib/supabase/mappers";
import DashboardStats from "@/components/admin/DashboardStats";
import { StatusBadge } from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { DashboardStats as Stats } from "@/types";

const ORDER_SELECT = `
  *,
  order_items (
    id, order_id, product_id,
    product_name, product_image,
    quantity, price
  )
`;

export default async function AdminDashboard() {
  const supabase = createClient();

  // Server-side admin guard
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "ADMIN") redirect("/");

  // Fetch all data in parallel
  const [ordersRes, productsCountRes, customersCountRes, recentRes] = await Promise.all([
    supabase.from("orders").select("id, status, total_price"),
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "CLIENT"),
    supabase.from("orders").select(ORDER_SELECT).order("created_at", { ascending: false }).limit(5),
  ]);

  const orders = ordersRes.data ?? [];
  const totalRevenue = orders
    .filter((o) => o.status === "DELIVERED")
    .reduce((sum, o) => sum + Number(o.total_price), 0);

  const stats: Stats = {
    totalOrders:    orders.length,
    totalRevenue,
    totalProducts:  productsCountRes.count  ?? 0,
    totalCustomers: customersCountRes.count ?? 0,
    pendingOrders:  orders.filter((o) => o.status === "PENDING").length,
    recentOrders:   (recentRes.data ?? []).map((r) => mapOrder(r as Record<string, unknown>)),
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back! Here&apos;s what&apos;s happening.
        </p>
      </div>

      <DashboardStats stats={stats} />

      {/* Recent Orders */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-gray-900">Recent Orders</h2>
          <Link
            href="/admin/orders"
            className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-400">Order</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-400">Customer</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-400">Total</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-400">Status</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-400">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stats.recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-xs font-medium text-gray-500">
                      #{order.id.slice(-6).toUpperCase()}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-medium text-gray-900">{order.user.name}</td>
                  <td className="px-5 py-3.5 font-semibold text-gray-900">
                    {formatCurrency(order.totalPrice)}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-400">
                    {formatDate(order.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/products/new"
          className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-card hover:shadow-card-hover transition-shadow"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50">
            <Package className="h-5 w-5 text-brand-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Add New Product</p>
            <p className="text-xs text-gray-500">Add to your catalogue</p>
          </div>
          <ArrowRight className="ml-auto h-4 w-4 text-gray-400" />
        </Link>

        <Link
          href="/admin/orders"
          className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-card hover:shadow-card-hover transition-shadow"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
            <ShoppingBag className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Manage Orders</p>
            <p className="text-xs text-gray-500">{stats.pendingOrders} pending orders</p>
          </div>
          <ArrowRight className="ml-auto h-4 w-4 text-gray-400" />
        </Link>
      </div>
    </div>
  );
}
