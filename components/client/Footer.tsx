import Link from "next/link";
import { Leaf, Clock, Truck, ShieldCheck } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

const FEATURES = [
  { icon: Truck,        label: "Free Delivery",   sub: "On all orders"         },
  { icon: ShieldCheck,  label: "100% Fresh",       sub: "Guaranteed quality"    },
  { icon: Clock,        label: "Fast Checkout",    sub: "Order in 2 minutes"    },
];

const SHOP_LINKS = [
  { label: "Browse Products", href: "/"        },
  { label: "My Orders",       href: "/orders"  },
  { label: "My Profile",      href: "/profile" },
  { label: "Cart",            href: "/cart"    },
];

const COMPANY_LINKS = [
  { label: "About Us",         href: "/about"   },
  { label: "Contact Us",       href: "/contact" },
  { label: "Privacy Policy",   href: "/privacy" },
  { label: "Terms of Service", href: "/terms"   },
];

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white">
      {/* Features bar — hidden on mobile, show on md+ */}
      <div className="hidden md:block border-b border-gray-100 bg-brand-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 divide-x divide-brand-100">
            {FEATURES.map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-3 px-6 py-4">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-brand-100">
                  <Icon className="h-4 w-4 text-brand-700" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-brand-900">{label}</p>
                  <p className="text-xs text-brand-600">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm group-hover:bg-brand-700 transition-colors">
                <Leaf className="h-5 w-5" />
              </div>
              <span className="font-display text-xl font-bold text-gray-900">
                {APP_NAME}
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-gray-500">
              Premium fresh groceries delivered straight to your door.
              Quality you can taste, prices you&apos;ll love.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
                🌿 Organic
              </span>
              <span className="rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
                🚚 Fast Delivery
              </span>
              <span className="rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
                💳 Cash on Delivery
              </span>
            </div>
          </div>

          {/* Shop links */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Shop
            </h3>
            <ul className="space-y-2.5">
              {SHOP_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-gray-600 hover:text-brand-600 transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Company
            </h3>
            <ul className="space-y-2.5">
              {COMPANY_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-gray-600 hover:text-brand-600 transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-gray-100 pt-6 sm:flex-row">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-xs text-gray-400 hover:text-brand-600 transition-colors">
              Privacy
            </Link>
            <span className="text-gray-200">•</span>
            <Link href="/terms" className="text-xs text-gray-400 hover:text-brand-600 transition-colors">
              Terms
            </Link>
            <span className="text-gray-200">•</span>
            <Link href="/contact" className="text-xs text-gray-400 hover:text-brand-600 transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
