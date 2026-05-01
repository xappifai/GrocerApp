"use client";

import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Package } from "lucide-react";
import ProductCard from "@/components/client/ProductCard";
import { CategoryFilter, SearchBar } from "@/components/client/CategoryFilter";
import { PageLoader, EmptyState } from "@/components/ui";
import { productService } from "@/services/productService";
import { debounce } from "@/lib/utils";
import type { Product, Category } from "@/types";

const LIMIT = 8;

interface HomeContentProps {
  initialProducts:    Product[];
  initialCategories:  Category[];
  initialTotalPages:  number;
  initialTotal:       number;
}

// Category quick-links shown below the hero on mobile
const CATEGORY_SHORTCUTS = [
  { emoji: "🥦", label: "Veggies",   slug: "fruits-vegetables" },
  { emoji: "🍓", label: "Fruits",    slug: "fruits-vegetables" },
  { emoji: "🥛", label: "Dairy",     slug: "dairy-eggs"        },
  { emoji: "🥩", label: "Meat",      slug: "meat-seafood"      },
  { emoji: "🍞", label: "Bakery",    slug: "bakery"            },
  { emoji: "🧃", label: "Drinks",    slug: "beverages"         },
  { emoji: "🥜", label: "Snacks",    slug: "snacks"            },
  { emoji: "🧺", label: "Pantry",    slug: "pantry"            },
];

export default function HomeContent({
  initialProducts,
  initialCategories,
  initialTotalPages,
  initialTotal,
}: HomeContentProps) {
  const [products, setProducts]       = useState<Product[]>(initialProducts);
  const [categories]                  = useState<Category[]>(initialCategories);
  const [isLoading, setIsLoading]     = useState(false);
  const [search, setSearch]           = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [page, setPage]               = useState(1);
  const [totalPages, setTotalPages]   = useState(initialTotalPages);
  const [total, setTotal]             = useState(initialTotal);

  const fetchProducts = useCallback(
    async (q: string, cat: string, p: number) => {
      setIsLoading(true);
      try {
        const res = await productService.getAll({
          search:   q || undefined,
          category: cat !== "all" ? cat : undefined,
          page:     p,
          limit:    LIMIT,
        });
        setProducts(res.data);
        setTotalPages(res.totalPages);
        setTotal(res.total);
      } catch {
        // silent
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const debouncedFetch = useCallback(
    debounce((q: string, cat: string, p: number) => fetchProducts(q, cat, p), 350),
    [fetchProducts]
  );

  useEffect(() => {
    if (search === "" && activeCategory === "all" && page === 1) return;
    debouncedFetch(search, activeCategory, page);
  }, [search, activeCategory, page, debouncedFetch]);

  const handleSearch = (q: string) => { setSearch(q); setPage(1); };
  const handleCategory = (slug: string) => { setActiveCategory(slug); setPage(1); };

  return (
    <div className="space-y-5 md:space-y-8">

      {/* ── Hero ─────────────────────────────────────────────────────────────
           Mobile:  compact app-style banner (shorter, no emoji row)
           Desktop: full two-column gradient card
      ──────────────────────────────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-brand-700 to-brand-900 text-white md:rounded-3xl">
        <div className="grid xl:grid-cols-2 xl:items-center">

          {/* Text block */}
          <div className="px-6 py-8 md:px-12 md:py-14 xl:py-16">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-200">
              🌿 Fresh &amp; Organic
            </span>
            {/* Shorter headline on mobile */}
            <h1 className="mt-3 font-display font-bold leading-tight
                           text-3xl
                           md:text-5xl
                           xl:text-6xl">
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

          {/* Category grid — xl only */}
          <div className="hidden xl:flex xl:items-center xl:justify-center xl:pr-10 xl:py-10">
            <div className="grid grid-cols-3 gap-3">
              {CATEGORY_SHORTCUTS.slice(0, 6).map(({ emoji, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-1.5 rounded-2xl bg-white/10 px-5 py-4 backdrop-blur-sm hover:bg-white/20 transition-colors cursor-pointer"
                >
                  <span className="text-3xl">{emoji}</span>
                  <span className="text-xs font-medium text-brand-100">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Category shortcut grid — mobile only ─────────────────────────── */}
      <div className="md:hidden">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Browse by category
        </h2>
        <div className="grid grid-cols-4 gap-2.5">
          {CATEGORY_SHORTCUTS.map(({ emoji, label, slug }) => {
            const active = activeCategory === slug;
            return (
              <button
                key={label}
                onClick={() => handleCategory(active ? "all" : slug)}
                className={`flex flex-col items-center gap-1.5 rounded-2xl border py-3 transition-all ${
                  active
                    ? "border-brand-200 bg-brand-50"
                    : "border-gray-100 bg-white hover:border-brand-100 hover:bg-brand-50/50"
                }`}
              >
                <span className="text-2xl leading-none">{emoji}</span>
                <span className={`text-[10px] font-semibold ${active ? "text-brand-700" : "text-gray-600"}`}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Search + category pills ───────────────────────────────────────── */}
      <div className="space-y-3">
        <SearchBar value={search} onChange={handleSearch} />
        {/* Category pill row — hidden on mobile (grid above handles it) */}
        <div className="hidden md:block">
          <CategoryFilter
            categories={categories}
            selected={activeCategory}
            onChange={handleCategory}
          />
        </div>
      </div>

      {/* Results count */}
      {!isLoading && (
        <div className="flex items-center justify-between">
          <h2 className="text-sm text-gray-500">
            {total > 0 ? (
              <>
                Showing{" "}
                <span className="font-medium text-gray-900">{products.length}</span> of{" "}
                <span className="font-medium text-gray-900">{total}</span> products
                {activeCategory !== "all" && (
                  <button
                    onClick={() => handleCategory("all")}
                    className="ml-2 text-xs text-brand-600 hover:underline"
                  >
                    Clear
                  </button>
                )}
              </>
            ) : (
              "No products found"
            )}
          </h2>
        </div>
      )}

      {/* ── Product grid ──────────────────────────────────────────────────── */}
      {isLoading ? (
        <PageLoader />
      ) : products.length === 0 ? (
        <EmptyState
          icon={<Package className="h-7 w-7" />}
          title="No products found"
          description={
            search
              ? `No results for "${search}". Try a different search term.`
              : "No products available in this category yet."
          }
          action={
            <button
              onClick={() => { handleSearch(""); handleCategory("all"); }}
              className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              Clear filters
            </button>
          }
        />
      ) : (
        <>
          {/* 2-col on mobile, scales up to 5-col on xl */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-5">
            {products.map((product, index) => (
              <div key={product.id} className="animate-fade-in">
                <ProductCard product={product} priority={index < 4} />
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                aria-label="Previous page"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  aria-label={`Go to page ${p}`}
                  aria-current={p === page ? "page" : undefined}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                    p === page
                      ? "bg-brand-600 text-white"
                      : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                aria-label="Next page"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
