"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus, Pencil, Trash2, Search, Package,
  AlertTriangle, ChevronDown, ChevronRight, Tag,
} from "lucide-react";
import { productService } from "@/services/productService";
import { createClient } from "@/lib/supabase/client";
import { revalidateProductCaches } from "@/app/admin/actions";
import { ConfirmModal, EmptyState } from "@/components/ui";
import Button from "@/components/ui/Button";
import { formatCurrency, imageUrl } from "@/lib/utils";
import type { Category, Product } from "@/types";
import toast from "react-hot-toast";

interface Props {
  initialProducts: Product[];
  categories:      Category[];
}

// ─── Product row (shared between flat search view and category sections) ─────

interface ProductRowProps {
  product:       Product;
  showCategory?: boolean;
  onEdit:        (id: string) => void;
  onDelete:      (id: string) => void;
}

function ProductRow({ product, showCategory = false, onEdit, onDelete }: ProductRowProps) {
  return (
    <tr className="hover:bg-gray-50/50 transition-colors">
      {/* Product name + image */}
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
            <Image
              src={imageUrl(product.image)}
              alt={product.name}
              fill
              className="object-cover"
              sizes="36px"
            />
          </div>
          <div>
            <p className="font-medium text-gray-900 leading-tight">{product.name}</p>
            <p className="line-clamp-1 max-w-[220px] text-xs text-gray-400 mt-0.5">
              {product.description}
            </p>
          </div>
        </div>
      </td>

      {/* Category badge — only shown in flat search view */}
      {showCategory && (
        <td className="px-5 py-3.5">
          <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">
            {product.category.name || "Uncategorised"}
          </span>
        </td>
      )}

      {/* Price */}
      <td className="px-5 py-3.5 font-semibold text-gray-900 tabular-nums">
        {formatCurrency(product.price)}
      </td>

      {/* Stock */}
      <td className="px-5 py-3.5">
        <span
          className={`inline-flex items-center gap-1 text-sm font-medium ${
            product.stock === 0
              ? "text-red-600"
              : product.stock < 10
              ? "text-amber-600"
              : "text-gray-600"
          }`}
        >
          {product.stock === 0 ? (
            <><span className="h-1.5 w-1.5 rounded-full bg-red-500 inline-block" />Out of stock</>
          ) : product.stock < 10 ? (
            <><span className="h-1.5 w-1.5 rounded-full bg-amber-500 inline-block" />{product.stock} left</>
          ) : (
            product.stock
          )}
        </span>
      </td>

      {/* Actions */}
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-1.5">
          <Link
            href={`/admin/products/${product.id}/edit`}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            aria-label={`Edit ${product.name}`}
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </Link>
          <button
            onClick={() => onDelete(product.id)}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
            aria-label={`Delete ${product.name}`}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Table shell ──────────────────────────────────────────────────────────────

function ProductTable({
  products,
  showCategory = false,
  onEdit,
  onDelete,
}: {
  products:      Product[];
  showCategory?: boolean;
  onEdit:        (id: string) => void;
  onDelete:      (id: string) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-gray-100 bg-gray-50">
          <tr>
            <th scope="col" className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Product
            </th>
            {showCategory && (
              <th scope="col" className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                Category
              </th>
            )}
            <th scope="col" className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Price
            </th>
            <th scope="col" className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Stock
            </th>
            <th scope="col" className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {products.map((p) => (
            <ProductRow
              key={p.id}
              product={p}
              showCategory={showCategory}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Category section ─────────────────────────────────────────────────────────

function CategorySection({
  category,
  products,
  isOpen,
  onToggle,
  onEdit,
  onDelete,
}: {
  category: Category;
  products: Product[];
  isOpen:   boolean;
  onToggle: () => void;
  onEdit:   (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const outOfStock = products.filter((p) => p.stock === 0).length;
  const lowStock   = products.filter((p) => p.stock > 0 && p.stock < 10).length;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-card">
      {/* Section header */}
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-gray-50/60 transition-colors"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50">
            <Tag className="h-4 w-4 text-brand-600" aria-hidden="true" />
          </div>
          <div>
            <span className="font-semibold text-gray-900">{category.name}</span>
            <span className="ml-2 text-xs text-gray-400">
              {products.length} product{products.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Stock warnings */}
          {outOfStock > 0 && (
            <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">
              {outOfStock} out of stock
            </span>
          )}
          {lowStock > 0 && (
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-600">
              {lowStock} low stock
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Quick-add link for this category */}
          <Link
            href={`/admin/products/new?category=${category.slug}`}
            onClick={(e) => e.stopPropagation()}
            className="hidden sm:flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:border-brand-300 hover:text-brand-600 transition-colors"
            aria-label={`Add product to ${category.name}`}
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </Link>
          {isOpen
            ? <ChevronDown className="h-4 w-4 text-gray-400" aria-hidden="true" />
            : <ChevronRight className="h-4 w-4 text-gray-400" aria-hidden="true" />
          }
        </div>
      </button>

      {/* Collapsible product table */}
      {isOpen && (
        products.length === 0 ? (
          <div className="flex items-center justify-center gap-2 border-t border-gray-100 px-5 py-8 text-sm text-gray-400">
            <Package className="h-4 w-4" />
            No products in this category yet.
            <Link
              href={`/admin/products/new?category=${category.slug}`}
              className="ml-1 font-medium text-brand-600 hover:underline"
            >
              Add one
            </Link>
          </div>
        ) : (
          <div className="border-t border-gray-100">
            <ProductTable
              products={products}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </div>
        )
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AdminProductsContent({ initialProducts, categories }: Props) {
  const router = useRouter();
  const [search,     setSearch]     = useState("");
  const [deleteId,   setDeleteId]   = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasOrders,  setHasOrders]  = useState(false);
  // Track which category sections are collapsed (all open by default)
  const [collapsed, setCollapsed]   = useState<Set<string>>(new Set());

  // ── Search filter (flat view) ──────────────────────────────────────────────
  const searchTerm = search.trim().toLowerCase();
  const filtered   = searchTerm
    ? initialProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm) ||
          p.category.name.toLowerCase().includes(searchTerm) ||
          p.description.toLowerCase().includes(searchTerm)
      )
    : [];

  // ── Group by category (for the section view) ──────────────────────────────
  const productsByCategory = new Map<string, Product[]>();

  // Seed the map with every known category in order (even empty ones are shown)
  for (const cat of categories) {
    productsByCategory.set(cat.id, []);
  }

  // Uncategorised bucket
  const uncategorised: Product[] = [];

  for (const p of initialProducts) {
    if (p.categoryId && productsByCategory.has(p.categoryId)) {
      productsByCategory.get(p.categoryId)!.push(p);
    } else {
      uncategorised.push(p);
    }
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  const toggleSection = (catId: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(catId) ? next.delete(catId) : next.add(catId);
      return next;
    });
  };

  const collapseAll = () => setCollapsed(new Set(categories.map((c) => c.id).concat("__uncategorised")));
  const expandAll   = () => setCollapsed(new Set());

  const requestDelete = async (productId: string) => {
    setDeleteId(productId);
    const supabase = createClient();
    const { count } = await supabase
      .from("order_items")
      .select("id", { count: "exact", head: true })
      .eq("product_id", productId);
    setHasOrders((count ?? 0) > 0);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const target = initialProducts.find((p) => p.id === deleteId);
      await productService.delete(deleteId);
      await revalidateProductCaches(deleteId, target?.category.slug);
      toast.success("Product deleted");
      router.refresh();
    } catch {
      toast.error("Failed to delete product");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
      setHasOrders(false);
    }
  };

  // ── Stats summary ──────────────────────────────────────────────────────────
  const totalOutOfStock = initialProducts.filter((p) => p.stock === 0).length;
  const totalLowStock   = initialProducts.filter((p) => p.stock > 0 && p.stock < 10).length;

  return (
    <>
      <div className="space-y-6">

        {/* ── Header ───────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-900">Products</h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-3 text-sm text-gray-500">
              <span>{initialProducts.length} total</span>
              <span className="text-gray-200">|</span>
              <span>{categories.length} categories</span>
              {totalOutOfStock > 0 && (
                <>
                  <span className="text-gray-200">|</span>
                  <span className="text-red-500 font-medium">{totalOutOfStock} out of stock</span>
                </>
              )}
              {totalLowStock > 0 && (
                <>
                  <span className="text-gray-200">|</span>
                  <span className="text-amber-500 font-medium">{totalLowStock} low stock</span>
                </>
              )}
            </div>
          </div>
          <Link href="/admin/products/new">
            <Button leftIcon={<Plus className="h-4 w-4" />}>Add Product</Button>
          </Link>
        </div>

        {/* ── Search ───────────────────────────────────────────────────────── */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, category or description…"
            aria-label="Search products"
            className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        {/* ── Flat search results ───────────────────────────────────────────── */}
        {searchTerm ? (
          filtered.length === 0 ? (
            <EmptyState
              icon={<Package className="h-7 w-7" />}
              title={`No products matching "${search}"`}
              description="Try a different name, category or description."
            />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-card">
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3 bg-gray-50">
                <p className="text-sm text-gray-500">
                  <span className="font-semibold text-gray-900">{filtered.length}</span>{" "}
                  result{filtered.length !== 1 ? "s" : ""} for &ldquo;{search}&rdquo;
                </p>
              </div>
              <ProductTable
                products={filtered}
                showCategory
                onEdit={() => {}}
                onDelete={requestDelete}
              />
            </div>
          )
        ) : (
          /* ── Category sections ──────────────────────────────────────────── */
          <>
            {/* Expand / collapse all */}
            {categories.length > 1 && (
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={expandAll}
                  className="text-xs font-medium text-brand-600 hover:text-brand-700 transition-colors"
                >
                  Expand all
                </button>
                <span className="text-gray-300">·</span>
                <button
                  onClick={collapseAll}
                  className="text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Collapse all
                </button>
              </div>
            )}

            <div className="space-y-4">
              {categories.map((cat) => (
                <CategorySection
                  key={cat.id}
                  category={cat}
                  products={productsByCategory.get(cat.id) ?? []}
                  isOpen={!collapsed.has(cat.id)}
                  onToggle={() => toggleSection(cat.id)}
                  onEdit={() => {}}
                  onDelete={requestDelete}
                />
              ))}

              {/* Uncategorised bucket — only shown when there are orphaned products */}
              {uncategorised.length > 0 && (
                <CategorySection
                  key="__uncategorised"
                  category={{ id: "__uncategorised", name: "Uncategorised", slug: "" }}
                  products={uncategorised}
                  isOpen={!collapsed.has("__uncategorised")}
                  onToggle={() => toggleSection("__uncategorised")}
                  onEdit={() => {}}
                  onDelete={requestDelete}
                />
              )}
            </div>
          </>
        )}
      </div>

      {/* ── Delete confirmation modal ────────────────────────────────────── */}
      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => { setDeleteId(null); setHasOrders(false); }}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete Product"
        message={
          hasOrders
            ? undefined
            : "Are you sure you want to delete this product? This action cannot be undone."
        }
      >
        {hasOrders && (
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" aria-hidden="true" />
            <span>
              <strong>This product has order history.</strong> Deleting it will remove the
              product from the catalogue but existing order records will be preserved
              (product name and price are snapshotted in each order). This cannot be undone.
            </span>
          </div>
        )}
      </ConfirmModal>
    </>
  );
}
