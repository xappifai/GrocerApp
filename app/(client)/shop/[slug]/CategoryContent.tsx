"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Package, ArrowLeft } from "lucide-react";
import ProductCard from "@/components/client/ProductCard";
import { SearchBar } from "@/components/client/CategoryFilter";
import { PageLoader, EmptyState } from "@/components/ui";
import { productService } from "@/services/productService";
import { debounce } from "@/lib/utils";
import type { Category, Product } from "@/types";

interface CategoryContentProps {
  category:         Category;
  initialProducts:  Product[];
  initialTotal:     number;
  initialTotalPages: number;
  pageLimit:        number;
}

export default function CategoryContent({
  category,
  initialProducts,
  initialTotal,
  initialTotalPages,
  pageLimit,
}: CategoryContentProps) {
  const [products, setProducts]     = useState<Product[]>(initialProducts);
  const [total, setTotal]           = useState(initialTotal);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [page, setPage]             = useState(1);
  const [search, setSearch]         = useState("");
  const [isLoading, setIsLoading]   = useState(false);

  const fetchProducts = useCallback(
    async (q: string, p: number) => {
      setIsLoading(true);
      try {
        const res = await productService.getAll({
          search:   q || undefined,
          category: category.slug,
          page:     p,
          limit:    pageLimit,
        });
        setProducts(res.data);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      } catch {
        // silent
      } finally {
        setIsLoading(false);
      }
    },
    [category.slug, pageLimit]
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedFetch = useCallback(
    debounce((q: string, p: number) => fetchProducts(q, p), 350),
    [fetchProducts]
  );

  useEffect(() => {
    // Skip the very first render — we already have SSR data
    if (search === "" && page === 1) return;
    debouncedFetch(search, page);
  }, [search, page, debouncedFetch]);

  const handleSearch = (q: string) => {
    setSearch(q);
    setPage(1);
  };

  const handlePage = (p: number) => {
    setPage(p);
    // Scroll to top of product list
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-6 md:space-y-8">

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-gray-500">
        <Link
          href="/"
          className="flex items-center gap-1 hover:text-brand-600 transition-colors font-medium"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Home
        </Link>
        <span className="text-gray-300">/</span>
        <span className="font-semibold text-gray-900">{category.name}</span>
      </nav>

      {/* Page title */}
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900 md:text-3xl">
          {category.name}
        </h1>
        {!isLoading && (
          <p className="mt-1 text-sm text-gray-500">
            {total} product{total !== 1 ? "s" : ""} available
          </p>
        )}
      </div>

      {/* Search */}
      <SearchBar
        value={search}
        onChange={handleSearch}
        placeholder={`Search in ${category.name}…`}
      />

      {/* Product grid */}
      {isLoading ? (
        <PageLoader />
      ) : products.length === 0 ? (
        <EmptyState
          icon={<Package className="h-7 w-7" />}
          title="No products found"
          description={
            search
              ? `No results for "${search}" in ${category.name}.`
              : `No products available in ${category.name} yet.`
          }
          action={
            search ? (
              <button
                onClick={() => handleSearch("")}
                className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
              >
                Clear search
              </button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-5">
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} priority={index < 4} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => handlePage(Math.max(1, page - 1))}
                disabled={page === 1}
                aria-label="Previous page"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => handlePage(p)}
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
                onClick={() => handlePage(Math.min(totalPages, page + 1))}
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
