"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Search, Package } from "lucide-react";
import { productService } from "@/services/productService";
import { ConfirmModal, EmptyState } from "@/components/ui";
import Button from "@/components/ui/Button";
import { formatCurrency, imageUrl } from "@/lib/utils";
import type { Product } from "@/types";
import toast from "react-hot-toast";

interface Props {
  initialProducts: Product[];
}

export default function AdminProductsContent({ initialProducts }: Props) {
  const router = useRouter();
  const [search, setSearch]     = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filtered = search
    ? initialProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.category.name.toLowerCase().includes(search.toLowerCase())
      )
    : initialProducts;

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await productService.delete(deleteId);
      toast.success("Product deleted");
      router.refresh(); // re-runs the server component to get fresh data
    } catch {
      toast.error("Failed to delete product");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-900">Products</h1>
            <p className="mt-1 text-sm text-gray-500">
              {initialProducts.length} total products
            </p>
          </div>
          <Link href="/admin/products/new">
            <Button leftIcon={<Plus className="h-4 w-4" />}>Add Product</Button>
          </Link>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Package className="h-7 w-7" />}
            title="No products found"
            action={
              <Link href="/admin/products/new">
                <Button leftIcon={<Plus className="h-4 w-4" />} size="sm">
                  Add Product
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="overflow-hidden rounded-2xl bg-white shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-100 bg-gray-50">
                  <tr>
                    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-400">Product</th>
                    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-400">Category</th>
                    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-400">Price</th>
                    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-400">Stock</th>
                    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                            <Image
                              src={imageUrl(product.image)}
                              alt={product.name}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{product.name}</p>
                            <p className="line-clamp-1 max-w-[200px] text-xs text-gray-400">
                              {product.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">
                          {product.category.name}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-semibold text-gray-900">
                        {formatCurrency(product.price)}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`text-sm font-medium ${
                            product.stock === 0
                              ? "text-red-600"
                              : product.stock < 10
                              ? "text-amber-600"
                              : "text-gray-600"
                          }`}
                        >
                          {product.stock === 0 ? "Out of stock" : product.stock}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => setDeleteId(product.id)}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
      />
    </>
  );
}
