"use client";

import { ShoppingBag, DollarSign, Package, Users, Clock } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { DashboardStats } from "@/types";

interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  trend?: string;
}

function StatsCard({ title, value, icon, iconBg, iconColor, trend }: StatsCardProps) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500">{title}</p>
          <p className="mt-1.5 font-display text-2xl font-bold text-gray-900">{value}</p>
          {trend && <p className="mt-1 text-xs text-gray-500">{trend}</p>}
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}>
          <span className={iconColor}>{icon}</span>
        </div>
      </div>
    </div>
  );
}

export default function DashboardStats({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
      <StatsCard
        title="Total Orders"
        value={stats.totalOrders.toLocaleString()}
        icon={<ShoppingBag className="h-5 w-5" />}
        iconBg="bg-brand-50"
        iconColor="text-brand-600"
        trend="All time"
      />
      <StatsCard
        title="Total Revenue"
        value={formatCurrency(stats.totalRevenue)}
        icon={<DollarSign className="h-5 w-5" />}
        iconBg="bg-emerald-50"
        iconColor="text-emerald-600"
        trend="Delivered orders"
      />
      <StatsCard
        title="Products"
        value={stats.totalProducts.toLocaleString()}
        icon={<Package className="h-5 w-5" />}
        iconBg="bg-blue-50"
        iconColor="text-blue-600"
        trend="In catalogue"
      />
      <StatsCard
        title="Customers"
        value={stats.totalCustomers.toLocaleString()}
        icon={<Users className="h-5 w-5" />}
        iconBg="bg-purple-50"
        iconColor="text-purple-600"
        trend="Registered users"
      />
      <StatsCard
        title="Pending Orders"
        value={stats.pendingOrders.toLocaleString()}
        icon={<Clock className="h-5 w-5" />}
        iconBg="bg-amber-50"
        iconColor="text-amber-600"
        trend="Need attention"
      />
    </div>
  );
}
