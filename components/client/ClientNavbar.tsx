"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, LogOut, Leaf } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { APP_NAME } from "@/lib/constants";
import { getInitials } from "@/lib/utils";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function ClientNavbar() {
  const router = useRouter();
  const { totalItems, toggleCart } = useCartStore();
  const { user, isAuthenticated, logout } = useAuthStore();

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const cartCount = mounted ? totalItems() : 0;

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white transition-all group-hover:bg-brand-700">
            <Leaf className="h-4 w-4" />
          </div>
          <span className="font-display text-lg font-bold text-gray-900">
            {APP_NAME}
          </span>
        </Link>

        {/* ── Desktop nav (hidden on mobile — bottom bar handles it) ── */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/" className="text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors">
            Shop
          </Link>
          {isAuthenticated && (
            <>
              <Link href="/orders"  className="text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors">My Orders</Link>
              <Link href="/profile" className="text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors">Profile</Link>
            </>
          )}
        </nav>

        {/* ── Right actions ── */}
        <div className="flex items-center gap-1">

          {/* Cart — desktop only (mobile has bottom bar) */}
          <button
            onClick={toggleCart}
            className="relative hidden rounded-lg p-2 text-gray-600 hover:bg-gray-100 transition-colors md:flex"
            aria-label="Open cart"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </button>

          {/* Auth — desktop only */}
          {isAuthenticated && user ? (
            <div className="hidden items-center gap-2 md:flex">
              <Link
                href="/profile"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-700 text-xs font-bold hover:bg-brand-200 transition-colors"
                title={`${user.name} — View profile`}
              >
                {getInitials(user.name)}
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                aria-label="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="hidden gap-2 md:flex">
              <Link href="/login"  className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">Login</Link>
              <Link href="/signup" className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700 transition-colors">Sign up</Link>
            </div>
          )}

          {/* Mobile: cart icon only (quick access alongside bottom bar) */}
          <button
            onClick={toggleCart}
            className="relative rounded-lg p-2 text-gray-600 hover:bg-gray-100 transition-colors md:hidden"
            aria-label={`Open cart${cartCount > 0 ? `, ${cartCount} items` : ""}`}
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </button>
        </div>

      </div>
    </header>
  );
}
