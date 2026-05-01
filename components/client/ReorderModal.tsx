"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  ShoppingCart, RefreshCw, AlertTriangle,
  TrendingUp, TrendingDown,
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { createClient } from "@/lib/supabase/client";
import { mapProduct } from "@/lib/supabase/mappers";
import { formatCurrency, imageUrl } from "@/lib/utils";
import { Modal } from "@/components/ui";
import type { Order } from "@/types";
import toast from "react-hot-toast";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ReorderItem {
  productId: string;
  name: string;
  image: string;
  quantity: number;
  originalPrice: number;
  currentPrice: number | null;
  currentStock: number;
  isAvailable: boolean;
}

interface Props {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ReorderModal({ order, isOpen, onClose }: Props) {
  const { addItem, openCart } = useCartStore();
  const [items, setItems]     = useState<ReorderItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch current prices whenever the modal opens
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      try {
        const supabase  = createClient();
        const ids       = order.items.map((i) => i.productId).filter(Boolean);
        const { data }  = await supabase
          .from("products")
          .select("id, price, stock")
          .in("id", ids);

        if (cancelled) return;

        const map = new Map(
          (data ?? []).map((p) => [
            p.id as string,
            { price: Number(p.price), stock: p.stock as number },
          ])
        );

        setItems(
          order.items.map((item) => {
            const cur = map.get(item.productId);
            return {
              productId:     item.productId,
              name:          item.product.name,
              image:         item.product.image,
              quantity:      item.quantity,
              originalPrice: item.price,
              currentPrice:  cur ? cur.price : null,
              currentStock:  cur ? cur.stock : 0,
              isAvailable:   !!cur && cur.stock >= item.quantity,
            };
          })
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => { cancelled = true; };
  }, [isOpen, order]);

  const available = items.filter((i) => i.isAvailable && i.currentPrice !== null);

  const handleAddToCart = async () => {
    if (available.length === 0) return;

    try {
      const supabase = createClient();
      const { data: products } = await supabase
        .from("products")
        .select("*, categories(*)")
        .in("id", available.map((i) => i.productId));

      if (!products?.length) { toast.error("Could not load products"); return; }

      products.forEach((p) => {
        const oi = available.find((i) => i.productId === p.id);
        if (oi) addItem(mapProduct(p as Record<string, unknown>), oi.quantity);
      });

      toast.success(
        `${available.length} item${available.length !== 1 ? "s" : ""} added to cart`
      );
      openCart();
      onClose();
    } catch {
      toast.error("Failed to add items to cart");
    }
  };

  const hasPriceChanges   = items.some(
    (i) => i.currentPrice !== null && i.currentPrice !== i.originalPrice
  );
  const hasUnavailable    = items.some((i) => !i.isAvailable);
  const newTotal          = available.reduce(
    (s, i) => s + i.currentPrice! * i.quantity, 0
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reorder" size="lg">
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-14">
          <RefreshCw className="h-5 w-5 animate-spin text-brand-500" />
          <span className="text-sm text-gray-500">Checking latest prices…</span>
        </div>
      ) : (
        <div className="space-y-4">

          {/* Alerts */}
          {hasPriceChanges && (
            <div className="flex items-start gap-2 rounded-xl border border-amber-100 bg-amber-50 p-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
              <p className="text-xs text-amber-700">
                Some prices have changed since your original order — updated prices are shown below.
              </p>
            </div>
          )}
          {hasUnavailable && (
            <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
              <p className="text-xs text-red-600">
                Some items are unavailable or out of stock and will be skipped.
              </p>
            </div>
          )}

          {/* Item list */}
          <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
            {items.map((item) => {
              const changed  = item.currentPrice !== null && item.currentPrice !== item.originalPrice;
              const priceUp  = changed && item.currentPrice! > item.originalPrice;
              const priceDown = changed && item.currentPrice! < item.originalPrice;

              return (
                <div
                  key={item.productId}
                  className={`flex items-center gap-3 rounded-xl p-3 ${
                    item.isAvailable ? "bg-gray-50" : "bg-gray-50 opacity-50"
                  }`}
                >
                  {/* Image */}
                  <div className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    <Image
                      src={imageUrl(item.image)}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="44px"
                    />
                  </div>

                  {/* Name + badges */}
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {item.name}
                    </p>
                    <div className="mt-0.5 flex items-center gap-1.5">
                      <span className="text-xs text-gray-500">
                        Qty: {item.quantity}
                      </span>
                      {!item.isAvailable && (
                        <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-600">
                          {item.currentPrice === null ? "Removed" : "Out of stock"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex-shrink-0 text-right">
                    {item.currentPrice !== null ? (
                      <>
                        <p
                          className={`text-sm font-semibold ${
                            priceUp   ? "text-red-600" :
                            priceDown ? "text-brand-600" :
                            "text-gray-900"
                          }`}
                        >
                          {formatCurrency(item.currentPrice * item.quantity)}
                        </p>
                        {changed && (
                          <div className="mt-0.5 flex items-center justify-end gap-0.5">
                            {priceUp ? (
                              <TrendingUp className="h-3 w-3 text-red-400" />
                            ) : (
                              <TrendingDown className="h-3 w-3 text-brand-500" />
                            )}
                            <span className="text-[10px] text-gray-400 line-through">
                              {formatCurrency(item.originalPrice * item.quantity)}
                            </span>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-gray-300">—</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* New total */}
          {available.length > 0 && (
            <div className="flex items-center justify-between rounded-xl bg-brand-50 px-4 py-3">
              <span className="text-sm font-medium text-brand-800">
                New total
                <span className="ml-1 text-brand-500 font-normal text-xs">
                  ({available.length} of {items.length} item
                  {items.length !== 1 ? "s" : ""})
                </span>
              </span>
              <span className="font-display text-lg font-bold text-brand-800">
                {formatCurrency(newTotal)}
              </span>
            </div>
          )}

          {/* CTA */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddToCart}
              disabled={available.length === 0}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 active:bg-brand-800 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
