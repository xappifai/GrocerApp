"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingCart, ClipboardList, User, LogIn } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const TABS = [
  {
    label: "Shop",
    href: "/",
    icon: Home,
    exact: true,
    authRequired: false,
  },
  {
    label: "Orders",
    href: "/orders",
    icon: ClipboardList,
    exact: false,
    authRequired: true,
  },
] as const;

export default function BottomTabBar() {
  const pathname              = usePathname();
  const { totalItems, toggleCart } = useCartStore();
  const { isAuthenticated }   = useAuthStore();

  // Defer to avoid hydration mismatch (Zustand persist)
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const cartCount = mounted ? totalItems() : 0;

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    // Safe-area bottom padding handles the iPhone home indicator notch
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
      aria-label="Main navigation"
    >
      {/* Blur glass bar */}
      <div className="border-t border-gray-100 bg-white/90 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-stretch">

          {/* Shop */}
          {TABS.filter((t) => t.href === "/").map(({ label, href, icon: Icon, exact }) => {
            const active = isActive(href, exact);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-semibold transition-colors",
                  active ? "text-brand-600" : "text-gray-400 hover:text-gray-600"
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon className={cn("h-5 w-5 transition-transform", active && "scale-110")} />
                {label}
                {active && (
                  <span className="absolute bottom-[calc(env(safe-area-inset-bottom)+0px)] h-0.5 w-8 rounded-full bg-brand-600" />
                )}
              </Link>
            );
          })}

          {/* Orders */}
          {(() => {
            const tab = TABS.find((t) => t.href === "/orders")!;
            const active = isActive(tab.href, tab.exact);
            if (tab.authRequired && !isAuthenticated) return null;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-semibold transition-colors",
                  active ? "text-brand-600" : "text-gray-400 hover:text-gray-600"
                )}
                aria-current={active ? "page" : undefined}
              >
                <tab.icon className={cn("h-5 w-5 transition-transform", active && "scale-110")} />
                Orders
              </Link>
            );
          })()}

          {/* Cart — centre tab, pill-shaped button */}
          <button
            onClick={toggleCart}
            className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-semibold text-gray-400 hover:text-brand-600 transition-colors"
            aria-label={`Open cart${cartCount > 0 ? `, ${cartCount} items` : ""}`}
          >
            <span className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-[9px] font-bold text-white leading-none">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </span>
            Cart
          </button>

          {/* Profile / Login */}
          {isAuthenticated ? (
            <Link
              href="/profile"
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-semibold transition-colors",
                pathname.startsWith("/profile") ? "text-brand-600" : "text-gray-400 hover:text-gray-600"
              )}
              aria-current={pathname.startsWith("/profile") ? "page" : undefined}
            >
              <User
                className={cn(
                  "h-5 w-5 transition-transform",
                  pathname.startsWith("/profile") && "scale-110"
                )}
              />
              Profile
            </Link>
          ) : (
            <Link
              href="/login"
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-semibold transition-colors",
                pathname === "/login" ? "text-brand-600" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <LogIn className="h-5 w-5" />
              Login
            </Link>
          )}

        </div>
      </div>
    </nav>
  );
}
