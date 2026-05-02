"use client";

import { memo, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Package, Search, X } from "lucide-react";
import ProductCard from "@/components/client/ProductCard";
import { PageLoader, EmptyState } from "@/components/ui";
import { productService } from "@/services/productService";
import { debounce } from "@/lib/utils";
import type { Category, Product } from "@/types";
import toast from "react-hot-toast";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Section {
  category: Category;
  products: Product[];
  total: number; // total products in DB for this category
}

interface HomeContentProps {
  sections: Section[];
}

// ---------------------------------------------------------------------------
// Category emoji map (quick-look icons)
// ---------------------------------------------------------------------------
const CATEGORY_EMOJI: Record<string, string> = {
  dairy:                "🥛",
  "rice-atta-grains":   "🌾",
  "daal-pulses":        "🫘",
  "oils-ghee":          "🫙",
  "spices-masala":      "🌶️",
  "sauces-condiments":  "🧴",
  beverages:            "🧃",
  "household-cleaning": "🧹",
  laundry:              "🧺",
};

// ---------------------------------------------------------------------------
// CategorySection — memoised so it never re-renders due to search state changes
// ---------------------------------------------------------------------------
const CategorySection = memo(function CategorySection({
  section,
  priority,
}: {
  section: Section;
  priority: boolean;
}) {
  const { category, products, total } = section;
  const hasMore = total > products.length;
  const emoji = CATEGORY_EMOJI[category.slug] ?? "🛒";

  return (
    <section aria-labelledby={`section-${category.slug}`}>
      {/* Section header */}
      <div className="mb-4 flex items-center justify-between">
        <h2
          id={`section-${category.slug}`}
          className="flex items-center gap-2 font-display text-xl font-bold text-gray-900 md:text-2xl"
        >
          <span className="text-2xl leading-none">{emoji}</span>
          {category.name}
        </h2>

        {hasMore && (
          <Link
            href={`/shop/${category.slug}`}
            className="flex items-center gap-1 rounded-xl bg-brand-50 px-3 py-1.5 text-sm font-semibold text-brand-700 hover:bg-brand-100 transition-colors"
          >
            View all {total}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      {/* Mobile: horizontal scroll row */}
      <div className="md:hidden">
        <div className="-mx-4 px-4 overflow-x-auto pb-2">
          <div className="flex gap-3" style={{ width: "max-content" }}>
            {products.map((product, index) => (
              <div key={product.id} className="w-44 flex-shrink-0">
                <ProductCard product={product} priority={priority && index < 2} />
              </div>
            ))}
            {hasMore && (
              <Link
                href={`/shop/${category.slug}`}
                className="flex w-32 flex-shrink-0 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-brand-200 bg-brand-50 text-brand-700 hover:border-brand-400 hover:bg-brand-100 transition-colors"
              >
                <ArrowRight className="h-6 w-6" />
                <span className="text-xs font-semibold text-center px-2">
                  {total - products.length} more
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Desktop: 4-column grid */}
      <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} priority={priority && index < 4} />
        ))}
      </div>
    </section>
  );
});

// ---------------------------------------------------------------------------
// SearchResults — shown only when search is active
// ---------------------------------------------------------------------------
function SearchResults({
  query,
  results,
  isLoading,
  onClear,
}: {
  query: string;
  results: Product[];
  isLoading: boolean;
  onClear: () => void;
}) {
  if (isLoading) return <PageLoader />;

  if (results.length === 0) {
    return (
      <EmptyState
        icon={<Package className="h-7 w-7" />}
        title="No products found"
        description={`No results for "${query}". Try a different search term.`}
        action={
          <button
            onClick={onClear}
            className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Clear search
          </button>
        }
      />
    );
  }

  return (
    <div>
      <p className="mb-3 text-sm text-gray-500">
        <span className="font-medium text-gray-900">{results.length}</span> result
        {results.length !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-5">
        {results.map((product, index) => (
          <ProductCard key={product.id} product={product} priority={index < 4} />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// HomeContent
// ---------------------------------------------------------------------------
export default function HomeContent({ sections }: HomeContentProps) {
  const [search, setSearch]           = useState("");
  const [searchResults, setResults]   = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setIsSearching(true);
    try {
      const res = await productService.getAll({ search: q, limit: 48 });
      setResults(res.data);
    } catch {
      toast.error("Search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(debounce(doSearch, 400), [doSearch]);

  useEffect(() => {
    if (search.trim()) {
      debouncedSearch(search);
    } else {
      setResults([]);
    }
  }, [search, debouncedSearch]);

  const clearSearch = () => setSearch("");
  const isSearchActive = search.trim().length > 0;

  return (
    <div className="space-y-10 md:space-y-14">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-brand-700 to-brand-900 text-white md:rounded-3xl">
        <div className="grid xl:grid-cols-2 xl:items-center">

          {/* Text block */}
          <div className="px-6 py-8 md:px-12 md:py-14 xl:py-16">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-200">
              🌿 Fresh &amp; Organic
            </span>
            <h1 className="mt-3 font-display font-bold leading-tight text-3xl md:text-5xl xl:text-6xl">
              Your groceries,{" "}
              <span className="text-brand-200">sorted.</span>
            </h1>
            <p className="mt-3 text-sm text-brand-100 leading-relaxed md:mt-4 md:max-w-md md:text-base">
              Hundreds of fresh products, delivered fast to your door.
            </p>

            {/* Feature pills — desktop only */}
            <div className="mt-6 hidden flex-wrap gap-3 xl:flex">
              {[
                { icon: "🚚", text: "Free Delivery" },
                { icon: "⚡", text: "Fast Checkout" },
                { icon: "🌿", text: "100% Fresh"    },
              ].map(({ icon, text }) => (
                <span
                  key={text}
                  className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm"
                >
                  {icon} {text}
                </span>
              ))}
            </div>
          </div>

          {/* Category quick-links — xl sidebar */}
          <div className="hidden xl:flex xl:items-center xl:justify-center xl:pr-10 xl:py-10">
            <div className="grid grid-cols-4 gap-3">
              {sections.slice(0, 8).map(({ category }) => (
                <Link
                  key={category.id}
                  href={`/shop/${category.slug}`}
                  className="flex flex-col items-center gap-1.5 rounded-2xl bg-white/10 px-4 py-4 backdrop-blur-sm hover:bg-white/20 transition-colors"
                >
                  <span className="text-2xl">{CATEGORY_EMOJI[category.slug] ?? "🛒"}</span>
                  <span className="text-xs font-medium text-brand-100">{category.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Category shortcut grid — mobile only ────────────────────────── */}
      <div className="md:hidden -mt-4">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Browse by category
        </h2>
        <div className="grid grid-cols-4 gap-2.5">
          {sections.slice(0, 8).map(({ category }) => (
            <Link
              key={category.id}
              href={`/shop/${category.slug}`}
              className="flex flex-col items-center gap-1.5 rounded-2xl border border-gray-100 bg-white py-3 hover:border-brand-100 hover:bg-brand-50/50 transition-all"
            >
              <span className="text-2xl leading-none">
                {CATEGORY_EMOJI[category.slug] ?? "🛒"}
              </span>
              <span className="text-[10px] font-semibold text-gray-600">
                {category.name.split(" ")[0]}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Search bar ──────────────────────────────────────────────────── */}
      <div className="relative">
        <label htmlFor="homepage-search" className="sr-only">
          Search products
        </label>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
        <input
          id="homepage-search"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search across all products…"
          autoComplete="off"
          className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-10 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-colors"
        />
        {search && (
          <button
            onClick={clearSearch}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* ── Content: search results OR category sections ─────────────────── */}
      {isSearchActive ? (
        <SearchResults
          query={search}
          results={searchResults}
          isLoading={isSearching}
          onClear={clearSearch}
        />
      ) : (
        <div className="space-y-12 md:space-y-16">
          {sections.map((section, idx) => (
            <CategorySection
              key={section.category.id}
              section={section}
              priority={idx === 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
