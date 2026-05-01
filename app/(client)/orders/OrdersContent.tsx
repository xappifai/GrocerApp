"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, ChevronDown, ChevronUp, ArrowLeft, RefreshCw, CalendarDays, X } from "lucide-react";
import { StatusBadge, EmptyState } from "@/components/ui";
import { formatCurrency, formatDate, imageUrl } from "@/lib/utils";
import ReorderModal from "@/components/client/ReorderModal";
import type { Order } from "@/types";

interface Props {
  initialOrders: Order[];
}

function toLocalDateStr(date: Date) {
  // Returns "YYYY-MM-DD" in local time (for comparison with date inputs)
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function OrdersContent({ initialOrders }: Props) {
  const [expanded, setExpanded]           = useState<string | null>(null);
  const [reorderTarget, setReorderTarget] = useState<Order | null>(null);
  const [dateFrom, setDateFrom]           = useState("");
  const [dateTo, setDateTo]               = useState("");

  const filteredOrders = useMemo(() => {
    if (!dateFrom && !dateTo) return initialOrders;
    return initialOrders.filter((order) => {
      const orderDay = toLocalDateStr(new Date(order.createdAt));
      if (dateFrom && orderDay < dateFrom) return false;
      if (dateTo   && orderDay > dateTo)   return false;
      return true;
    });
  }, [initialOrders, dateFrom, dateTo]);

  const hasFilter = dateFrom || dateTo;

  const clearFilter = () => {
    setDateFrom("");
    setDateTo("");
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Link href="/" className="rounded-lg p-2 text-gray-400 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-sm text-gray-500">{initialOrders.length} orders total</p>
        </div>
      </div>

      {/* ── Date filter ───────────────────────────────────────────────────── */}
      {initialOrders.length > 0 && (
        <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-card">
          <div className="flex flex-wrap items-end gap-3">
            <CalendarDays className="mb-0.5 h-4 w-4 flex-shrink-0 text-brand-600 self-end" />

            <div className="flex flex-col gap-1">
              <label htmlFor="date-from" className="text-xs font-medium text-gray-500">
                From
              </label>
              <input
                id="date-from"
                type="date"
                value={dateFrom}
                max={dateTo || undefined}
                onChange={(e) => setDateFrom(e.target.value)}
                className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="date-to" className="text-xs font-medium text-gray-500">
                To
              </label>
              <input
                id="date-to"
                type="date"
                value={dateTo}
                min={dateFrom || undefined}
                onChange={(e) => setDateTo(e.target.value)}
                className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              />
            </div>

            {hasFilter && (
              <button
                onClick={clearFilter}
                className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium text-gray-500 hover:border-red-200 hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                <X className="h-3.5 w-3.5" /> Clear
              </button>
            )}

            {/* Result count pill */}
            {hasFilter && (
              <span className="ml-auto self-end rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                {filteredOrders.length} of {initialOrders.length} orders
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── Order list ────────────────────────────────────────────────────── */}
      {filteredOrders.length === 0 ? (
        hasFilter ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-8 py-16 text-center">
            <CalendarDays className="mx-auto mb-3 h-8 w-8 text-gray-300" />
            <p className="font-semibold text-gray-700">No orders in this period</p>
            <p className="mt-1 text-sm text-gray-400">
              Try a different date range or clear the filter.
            </p>
            <button
              onClick={clearFilter}
              className="mt-4 rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              Clear filter
            </button>
          </div>
        ) : (
          <EmptyState
            icon={<ShoppingBag className="h-7 w-7" />}
            title="No orders yet"
            description="When you place an order, it will appear here."
            action={
              <Link
                href="/"
                className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
              >
                Shop now
              </Link>
            }
          />
        )
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="rounded-2xl bg-white shadow-card overflow-hidden">
              {/* Order header */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-gray-400">
                      #{order.id.slice(-8).toUpperCase()}
                    </span>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="mt-1 text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-display text-lg font-bold text-gray-900">
                      {formatCurrency(order.totalPrice)}
                    </p>
                    <p className="text-xs text-gray-400">{order.items.length} items</p>
                  </div>

                  {/* Reorder button */}
                  <button
                    onClick={() => setReorderTarget(order)}
                    className="flex items-center gap-1.5 rounded-xl border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100 transition-colors"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Reorder
                  </button>

                  <button
                    onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                    aria-label={expanded === order.id ? "Collapse order" : "Expand order"}
                    className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 transition-colors"
                  >
                    {expanded === order.id ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Expanded details */}
              {expanded === order.id && (
                <div className="border-t border-gray-100 px-5 pb-5 pt-4 space-y-4 animate-slide-in-up">
                  {/* Status tracker */}
                  <div className="flex items-center gap-0">
                    {(["PENDING", "PROCESSING", "DELIVERED"] as const).map((s, i, arr) => {
                      const statuses = ["PENDING", "PROCESSING", "DELIVERED"];
                      const currentIdx = statuses.indexOf(order.status);
                      const isDone = i <= currentIdx;
                      return (
                        <div key={s} className="flex flex-1 items-center">
                          <div className="flex flex-col items-center">
                            <div
                              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                                isDone
                                  ? "bg-brand-600 text-white"
                                  : "bg-gray-100 text-gray-400"
                              }`}
                            >
                              {i + 1}
                            </div>
                            <p
                              className={`mt-1 text-[10px] font-medium ${
                                isDone ? "text-brand-600" : "text-gray-400"
                              }`}
                            >
                              {s === "PENDING"
                                ? "Placed"
                                : s === "PROCESSING"
                                ? "Processing"
                                : "Delivered"}
                            </p>
                          </div>
                          {i < arr.length - 1 && (
                            <div
                              className={`h-0.5 flex-1 mx-1 ${
                                isDone && i < currentIdx
                                  ? "bg-brand-600"
                                  : "bg-gray-200"
                              }`}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Items */}
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 rounded-xl bg-gray-50 p-3"
                      >
                        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg">
                          <Image
                            src={imageUrl(item.product.image)}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-medium text-gray-900">
                            {item.product.name}
                          </p>
                          <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Delivery */}
                  <div className="rounded-xl bg-gray-50 p-3 text-sm text-gray-600">
                    <p className="font-medium text-gray-700">Delivery address</p>
                    <p>
                      {order.deliveryAddress}, {order.deliveryCity}
                    </p>
                    <p>{order.deliveryPhone}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Reorder modal */}
      {reorderTarget && (
        <ReorderModal
          order={reorderTarget}
          isOpen={!!reorderTarget}
          onClose={() => setReorderTarget(null)}
        />
      )}
    </div>
  );
}
