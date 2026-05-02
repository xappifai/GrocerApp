"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Minus, Plus, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { formatCurrency, imageUrl } from "@/lib/utils";

export default function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, totalPrice, totalItems, refreshCart } =
    useCartStore();

  // Refresh price/stock data every time the drawer opens
  useEffect(() => {
    if (isOpen) {
      refreshCart();
    }
  }, [isOpen, refreshCart]);

  const count = totalItems();
  const price = totalPrice();

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Close cart"
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-fade-in cursor-default"
          onClick={closeCart}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " " || e.key === "Escape") closeCart(); }}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-white shadow-modal transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-brand-600" />
            <h2 className="font-display text-lg font-semibold text-gray-900">
              Your Cart
            </h2>
            {count > 0 && (
              <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-bold text-brand-700">
                {count}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            aria-label="Close cart"
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
                <ShoppingBag className="h-7 w-7 text-gray-400" />
              </div>
              <h3 className="mb-1 text-sm font-semibold text-gray-900">Cart is empty</h3>
              <p className="mb-4 text-xs text-gray-500">Add some fresh groceries!</p>
              <button
                onClick={closeCart}
                className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.product.id} className="flex gap-3 rounded-xl bg-gray-50 p-3">
                  {/* Image */}
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    <Image
                      src={imageUrl(item.product.image)}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex flex-1 flex-col gap-1 min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-gray-500">{formatCurrency(item.product.price)} each</p>

                    <div className="flex items-center justify-between">
                      {/* Quantity controls */}
                      <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-0.5">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          aria-label={`Decrease quantity of ${item.product.name}`}
                          className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-gray-100 text-gray-500"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="min-w-[1.25rem] text-center text-xs font-semibold" aria-live="polite">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          aria-label={`Increase quantity of ${item.product.name}`}
                          className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-600 text-white hover:bg-brand-700"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">
                          {formatCurrency(item.product.price * item.quantity)}
                        </span>
                        <button
                          onClick={() => removeItem(item.product.id)}
                          aria-label={`Remove ${item.product.name} from cart`}
                          className="rounded-md p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 px-5 py-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Subtotal</span>
              <span className="font-display text-lg font-bold text-gray-900">
                {formatCurrency(price)}
              </span>
            </div>
            <p className="text-xs text-gray-500">Delivery charges calculated at checkout</p>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-700 active:bg-brand-800 transition-colors"
            >
              Proceed to Checkout
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
