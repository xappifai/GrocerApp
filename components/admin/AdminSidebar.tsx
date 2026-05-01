"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  MessageSquare,
  LogOut,
  Leaf,
  Plus,
  ChevronRight,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { cn, getInitials } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";
import toast from "react-hot-toast";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "Products",
    href: "/admin/products",
    icon: Package,
    exact: false,
  },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: ShoppingBag,
    exact: false,
  },
  {
    label: "Messages",
    href: "/admin/messages",
    icon: MessageSquare,
    exact: false,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out");
    router.push("/login");
  };

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <aside className="flex h-full w-64 flex-col border-r border-gray-100 bg-white">
      {/* Logo */}
      <div className="flex items-center gap-2.5 border-b border-gray-100 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
          <Leaf className="h-4 w-4" />
        </div>
        <div>
          <p className="font-display text-sm font-bold text-gray-900">{APP_NAME}</p>
          <p className="text-xs text-gray-400">Admin Panel</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
                active
                  ? "bg-brand-50 text-brand-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon
                className={cn(
                  "h-4 w-4 flex-shrink-0",
                  active ? "text-brand-600" : "text-gray-400"
                )}
              />
              {item.label}
              {active && (
                <ChevronRight className="ml-auto h-3.5 w-3.5 text-brand-400" />
              )}
            </Link>
          );
        })}

        {/* Quick action */}
        <div className="pt-4">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            Quick Actions
          </p>
          <Link
            href="/admin/products/new"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
          >
            <Plus className="h-4 w-4 text-gray-400" />
            Add Product
          </Link>
        </div>
      </nav>

      {/* User Footer */}
      <div className="border-t border-gray-100 px-3 py-3">
        <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-3 py-2.5">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
            {user ? getInitials(user.name) : "A"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-gray-900">
              {user?.name ?? "Admin"}
            </p>
            <p className="truncate text-[10px] text-gray-400">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg p-1 text-gray-400 hover:bg-white hover:text-red-500 transition-colors"
            aria-label="Logout"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
