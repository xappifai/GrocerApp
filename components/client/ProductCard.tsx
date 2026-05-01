"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Plus, Minus, Eye } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { formatCurrency, imageUrl } from "@/lib/utils";
import type { Product } from "@/types";
import toast from "react-hot-toast";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const { items, addItem, updateQuantity, removeItem, openCart } = useCartStore();
  const cartItem = items.find((i) => i.product.id === product.id);
  const quantity = cartItem?.quantity ?? 0;
  const isOutOfStock = product.stock === 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOutOfStock) return;
    addItem(product);
    toast.success(`${product.name} added to cart`, {
      icon: "🛒",
      duration: 1500,
    });
  };

  const handleIncrease = (e: React.MouseEvent) => {
    e.preventDefault();
    if (quantity >= product.stock) {
      toast.error("Maximum stock reached");
      return;
    }
    updateQuantity(product.id, quantity + 1);
  };

  const handleDecrease = (e: React.MouseEvent) => {
    e.preventDefault();
    if (quantity === 1) {
      removeItem(product.id);
    } else {
      updateQuantity(product.id, quantity - 1);
    }
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-card hover:shadow-card-hover transition-all duration-300">
      {/* Image */}
      <Link href={`/products/${product.id}`} className="relative block overflow-hidden">
        <div className="relative h-48 w-full bg-gray-50">
          <Image
            src={imageUrl(product.image)}
            alt={product.name}
            fill
            priority={priority}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700">
                Out of Stock
              </span>
            </div>
          )}

          {/* Quick view indicator (no nested <a> — outer Link already handles navigation) */}
          <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-gray-700 shadow-sm">
              <Eye className="h-4 w-4" />
            </span>
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        {/* Category */}
        <span className="mb-1 text-xs font-medium text-brand-600">
          {product.category.name}
        </span>

        {/* Name */}
        <Link href={`/products/${product.id}`}>
          <h3 className="mb-1 line-clamp-2 text-sm font-semibold text-gray-900 hover:text-brand-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Stock indicator */}
        {!isOutOfStock && product.stock < 10 && (
          <p className="mb-2 text-xs text-amber-600 font-medium">
            Only {product.stock} left!
          </p>
        )}

        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="font-display text-base font-bold text-gray-900">
            {formatCurrency(product.price)}
          </span>

          {/* Cart controls */}
          {quantity === 0 ? (
            <button
              onClick={handleAdd}
              disabled={isOutOfStock}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              aria-label="Add to cart"
            >
              <ShoppingCart className="h-4 w-4" />
            </button>
          ) : (
            <div className="flex items-center gap-1 rounded-xl border border-gray-200 p-0.5">
              <button
                onClick={handleDecrease}
                aria-label="Decrease quantity"
                className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="min-w-[1.5rem] text-center text-sm font-semibold text-gray-900" aria-live="polite">
                {quantity}
              </span>
              <button
                onClick={handleIncrease}
                aria-label="Increase quantity"
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
