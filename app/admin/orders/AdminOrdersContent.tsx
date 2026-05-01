"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Filter, RefreshCw, TrendingUp } from "lucide-react";
import { orderService } from "@/services/orderService";
import type { Order, OrderStatus } from "@/types";
import OrdersTable from "@/components/admin/OrdersTable";
import { Spinner } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";

const STATUS_TABS: { label: string; value: OrderStatus | "ALL" }[] = [
  { label: "All Orders",  value: "ALL"        },
  { label: "Pending",     value: "PENDING"    },
  { label: "Processing",  value: "PROCESSING" },
  { label: "Delivered",   value: "DELIVERED"  },
];

interface Props {
  initialOrders: Order[];
}

export default function AdminOrdersContent({ initialOrders }: Props) {
  const router = useRouter();
  const [orders, setOrders]         = useState<Order[]>(initialOrders);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab]   = useState<OrderStatus | "ALL">("ALL");
  const [search, setSearch]         = useState("");
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const fresh = await orderService.getAllOrders();
      setOrders(fresh);
    } catch {
      toast.error("Failed to refresh orders");
    } finally {
      setRefreshing(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, status: OrderStatus) => {
    setIsUpdating(orderId);
    try {
      await orderService.updateStatus(orderId, status);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
      toast.success("Order status updated");
      router.refresh();
    } catch {
      toast.error("Failed to update status");
    } finally {
      setIsUpdating(null);
    }
  };

  const filtered = orders.filter((o) => {
    const matchesTab    = activeTab === "ALL" || o.status === activeTab;
    const q             = search.toLowerCase();
    const matchesSearch =
      !q ||
      o.id.toLowerCase().includes(q) ||
      o.user?.name?.toLowerCase().includes(q) ||
      o.user?.email?.toLowerCase().includes(q);
    return matchesTab && matchesSearch;
  });

  const totalRevenue  = orders
    .filter((o) => o.status === "DELIVERED")
    .reduce((sum, o) => sum + o.totalPrice, 0);

  const countByStatus = (s: OrderStatus) => orders.filter((o) => o.status === s).length;

  const summaryCards = [
    { label: "Total Orders", value: orders.length,             color: "bg-brand-50 text-brand-700 border-brand-100"     },
    { label: "Pending",      value: countByStatus("PENDING"),   color: "bg-amber-50 text-amber-700 border-amber-100"     },
    { label: "Processing",   value: countByStatus("PROCESSING"),color: "bg-blue-50 text-blue-700 border-blue-100"        },
    { label: "Delivered",    value: countByStatus("DELIVERED"), color: "bg-emerald-50 text-emerald-700 border-emerald-100"},
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-neutral-900">Orders</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Manage and track all customer orders</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-semibold text-emerald-700">
              {formatCurrency(totalRevenue)} revenue
            </span>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-neutral-600 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <div key={card.label} className={`border rounded-xl px-4 py-3 ${card.color}`}>
            <p className="text-xs font-medium opacity-70">{card.label}</p>
            <p className="text-2xl font-bold font-display mt-0.5">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white border border-neutral-200 rounded-xl p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by order ID or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400"
          />
        </div>
        <div className="flex items-center gap-1 bg-neutral-100 rounded-lg p-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                activeTab === tab.value
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              {tab.label}
              {tab.value !== "ALL" && (
                <span
                  className={`ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold ${
                    activeTab === tab.value
                      ? "bg-brand-100 text-brand-700"
                      : "bg-neutral-200 text-neutral-600"
                  }`}
                >
                  {countByStatus(tab.value as OrderStatus)}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-card">
        {refreshing ? (
          <div className="flex items-center justify-center h-64">
            <Spinner size="lg" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-2">
            <Filter className="w-10 h-10 text-neutral-300" />
            <p className="text-neutral-500 font-medium">No orders found</p>
            <p className="text-sm text-neutral-400">
              {search ? "Try a different search term" : "No orders in this status"}
            </p>
          </div>
        ) : (
          <OrdersTable
            orders={filtered}
            onStatusChange={handleStatusUpdate}
            isUpdating={isUpdating}
          />
        )}
      </div>

      <p className="text-xs text-neutral-400 text-right">
        Showing {filtered.length} of {orders.length} orders
      </p>
    </div>
  );
}
