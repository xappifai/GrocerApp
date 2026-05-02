"use client";

import { useState } from "react";
import { ChevronDown, Eye, MapPin } from "lucide-react";
import { StatusBadge, Modal } from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ORDER_STATUSES, ORDER_STATUS_LABELS } from "@/lib/constants";
import type { Order, OrderStatus } from "@/types";

interface OrdersTableProps {
  orders: Order[];
  onStatusChange: (id: string, status: OrderStatus) => Promise<void>;
  isUpdating: string | null;
}

export default function OrdersTable({ orders, onStatusChange, isUpdating }: OrdersTableProps) {
  const [viewOrder, setViewOrder] = useState<Order | null>(null);

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th scope="col" className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-500">Order ID</th>
                <th scope="col" className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-500">Customer</th>
                <th scope="col" className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-500">Items</th>
                <th scope="col" className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-500">Total</th>
                <th scope="col" className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                <th scope="col" className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-500">Date</th>
                <th scope="col" className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <span className="font-mono text-xs font-medium text-gray-500">
                      #{order.id.slice(-6).toUpperCase()}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{order.user.name}</p>
                      <p className="text-xs text-gray-400">{order.user.email}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-gray-600">
                      {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(order.totalPrice)}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-500">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewOrder(order)}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                        aria-label={`View details for order #${order.id.slice(-6).toUpperCase()}`}
                      >
                        <Eye className="h-4 w-4" aria-hidden="true" />
                      </button>

                      {/* Status dropdown */}
                      <div className="relative">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            onStatusChange(order.id, e.target.value as OrderStatus)
                          }
                          disabled={isUpdating === order.id}
                          aria-label={`Change status for order #${order.id.slice(-6).toUpperCase()}`}
                          className="cursor-pointer appearance-none rounded-lg border border-gray-200 bg-white px-2 py-1 pr-6 text-xs font-medium text-gray-700 focus:border-brand-400 focus:outline-none disabled:opacity-50"
                        >
                          {ORDER_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {ORDER_STATUS_LABELS[s]}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400" />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order detail modal */}
      <Modal
        isOpen={!!viewOrder}
        onClose={() => setViewOrder(null)}
        title={`Order #${viewOrder?.id.slice(-6).toUpperCase()}`}
        size="lg"
      >
        {viewOrder && (
          <div className="space-y-5">
            {/* Customer info */}
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                Customer
              </p>
              <p className="font-semibold text-gray-900">{viewOrder.user.name}</p>
              <p className="text-sm text-gray-500">{viewOrder.user.email}</p>
            </div>

            {/* Delivery */}
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                Delivery
              </p>
              <p className="text-sm text-gray-700">{viewOrder.deliveryAddress}</p>
              <p className="text-sm text-gray-700">{viewOrder.deliveryCity}</p>
              <p className="text-sm text-gray-700">{viewOrder.deliveryPhone}</p>

              {/* Google Maps link */}
              <a
                href={
                  viewOrder.deliveryLatitude != null && viewOrder.deliveryLongitude != null
                    ? `https://maps.google.com/?q=${viewOrder.deliveryLatitude},${viewOrder.deliveryLongitude}`
                    : `https://maps.google.com/?q=${encodeURIComponent(
                        `${viewOrder.deliveryAddress}, ${viewOrder.deliveryCity}`
                      )}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-brand-100 bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700 hover:bg-brand-100 transition-colors"
              >
                <MapPin className="h-3.5 w-3.5" />
                {viewOrder.deliveryLatitude != null
                  ? "View pinned location"
                  : "Search on Google Maps"}
              </a>
            </div>

            {/* Items */}
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                Items
              </p>
              <div className="space-y-2">
                {viewOrder.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-xl border border-gray-100 p-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.product.name}</p>
                      <p className="text-xs text-gray-400">
                        {formatCurrency(item.price)} × {item.quantity}
                      </p>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between rounded-xl bg-brand-50 p-4">
              <span className="font-semibold text-brand-800">Total</span>
              <span className="font-display text-xl font-bold text-brand-800">
                {formatCurrency(viewOrder.totalPrice)}
              </span>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
