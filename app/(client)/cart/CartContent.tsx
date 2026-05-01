"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ArrowLeft } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { formatCurrency, imageUrl } from "@/lib/utils";
import Button from "@/components/ui/Button";
import { EmptyState } from "@/components/ui";

export default function CartContent() {
  const { items, updateQuantity, removeItem, clearCart, totalPrice, totalItems } = useCartStore();
  const count = totalItems();
  const price = totalPrice();

  if (count === 0) {
    return (
      <EmptyState
        icon={<ShoppingBag className="h-7 w-7" />}
        title="Your cart is empty"
        description="Looks like you haven't added anything yet."
        action={
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            <ArrowLeft className="h-4 w-4" /> Start shopping
          </Link>
        }
      />
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-gray-900">Shopping Cart</h1>
        <button
          onClick={clearCart}
          className="text-sm text-red-500 hover:text-red-600 font-medium"
        >
          Clear all
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <div
              key={item.product.id}
              className="flex gap-4 rounded-2xl bg-white p-4 shadow-card"
            >
              <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-gray-50">
                <Image
                  src={imageUrl(item.product.image)}
                  alt={item.product.name}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </div>

              <div className="flex flex-1 flex-col gap-1">
                <div className="flex items-start justify-between">
                  <div>
                    <Link
                      href={`/products/${item.product.id}`}
                      className="font-semibold text-gray-900 hover:text-brand-600 transition-colors"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-xs text-gray-400">{item.product.category.name}</p>
                  </div>
                  <button
                    onClick={() => removeItem(item.product.id)}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-white text-gray-600 transition-colors"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="min-w-[2rem] text-center text-sm font-bold text-gray-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="text-right">
                    <p className="font-display text-base font-bold text-gray-900">
                      {formatCurrency(item.product.price * item.quantity)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatCurrency(item.product.price)} each
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <div className="rounded-2xl bg-white p-6 shadow-card">
            <h2 className="font-display text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({count} items)</span>
                <span>{formatCurrency(price)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery</span>
                <span className="text-brand-600 font-medium">Free</span>
              </div>
              <div className="h-px bg-gray-100" />
              <div className="flex justify-between font-bold text-gray-900">
                <span>Total</span>
                <span className="font-display text-lg">{formatCurrency(price)}</span>
              </div>
            </div>

            <Link href="/checkout">
              <Button fullWidth size="lg" className="mt-5" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Proceed to Checkout
              </Button>
            </Link>
          </div>

          <Link
            href="/"
            className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-brand-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
