"use client";

import { useState } from "react";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import Button from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";
import type { Product } from "@/types";

export default function ProductActions({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const { items, addItem, updateQuantity, openCart } = useCartStore();
  const cartItem = items.find((i) => i.product.id === product.id);
  const isOutOfStock = product.stock === 0;

  const handleAddToCart = () => {
    addItem(product, quantity);
    toast.success(`${product.name} added to cart!`, { icon: "🛒" });
    openCart();
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-end gap-2">
        <span className="font-display text-4xl font-bold text-gray-900">
          {formatCurrency(product.price)}
        </span>
      </div>

      {/* Quantity selector */}
      {!isOutOfStock && !cartItem && (
        <div className="flex items-center gap-3">
          <p className="text-sm font-medium text-gray-700">Quantity:</p>
          <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white text-gray-600"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="min-w-[2.5rem] text-center font-bold text-gray-900">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => Math.min(q + 1, product.stock))}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white hover:bg-brand-700"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Cart controls */}
      {cartItem ? (
        <div className="flex items-center gap-3 rounded-2xl bg-brand-50 p-4">
          <span className="text-sm font-medium text-brand-700">In your cart</span>
          <div className="flex items-center gap-1 rounded-xl border border-brand-200 bg-white p-1">
            <button
              onClick={() => updateQuantity(product.id, cartItem.quantity - 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-50"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="min-w-[2.5rem] text-center font-bold text-brand-700">
              {cartItem.quantity}
            </span>
            <button
              onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <Button variant="secondary" size="sm" onClick={openCart}>
            View Cart
          </Button>
        </div>
      ) : (
        <Button
          size="lg"
          fullWidth
          disabled={isOutOfStock}
          leftIcon={<ShoppingCart className="h-5 w-5" />}
          onClick={handleAddToCart}
        >
          {isOutOfStock ? "Out of Stock" : "Add to Cart"}
        </Button>
      )}
    </div>
  );
}
