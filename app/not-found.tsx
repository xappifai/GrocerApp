import Link from "next/link";
import { Leaf, Home, ShoppingBag, Search } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f8faf8] px-4">

      {/* Logo */}
      <Link href="/" className="mb-12 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white">
          <Leaf className="h-5 w-5" />
        </div>
        <span className="font-display text-xl font-bold text-gray-900">{APP_NAME}</span>
      </Link>

      {/* 404 visual */}
      <div className="mb-6 text-center">
        <p className="font-display text-9xl font-bold text-brand-100 select-none">404</p>
        <div className="-mt-8 relative">
          <h1 className="font-display text-2xl font-bold text-gray-900 md:text-3xl">
            Page not found
          </h1>
          <p className="mt-2 text-sm text-gray-500 max-w-xs mx-auto">
            The page you&rsquo;re looking for doesn&rsquo;t exist or has been moved.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
        >
          <Home className="h-4 w-4" />
          Back to Home
        </Link>
        <Link
          href="/orders"
          className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <ShoppingBag className="h-4 w-4" />
          My Orders
        </Link>
      </div>

      {/* Category hints */}
      <div className="mt-12 text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Or browse a category
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {[
            { emoji: "🥛", label: "Dairy",    slug: "dairy"              },
            { emoji: "🌾", label: "Grains",   slug: "rice-atta-grains"   },
            { emoji: "🫘", label: "Daal",     slug: "daal-pulses"        },
            { emoji: "🧃", label: "Drinks",   slug: "beverages"          },
          ].map(({ emoji, label, slug }) => (
            <Link
              key={slug}
              href={`/shop/${slug}`}
              className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 hover:border-brand-200 hover:text-brand-600 transition-colors"
            >
              <span>{emoji}</span>
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
