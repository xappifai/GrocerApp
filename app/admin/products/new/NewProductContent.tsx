"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ProductForm from "@/components/admin/ProductForm";
import { productService } from "@/services/productService";
import { revalidateProductCaches } from "@/app/admin/actions";
import type { Category, CreateProductInput } from "@/types";
import toast from "react-hot-toast";

interface Props {
  categories: Category[];
  defaultCategoryId?: string;
}

export default function NewProductContent({ categories, defaultCategoryId }: Props) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: CreateProductInput) => {
    setIsSubmitting(true);
    try {
      const created = await productService.create(data);
      // Bust ISR caches — category page and homepage will show the new product
      await revalidateProductCaches(created.id, created.category.slug);
      toast.success("Product created successfully!");
      router.push("/admin/products");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create product.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/products"
          className="p-2 rounded-lg text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold font-display text-neutral-900">
            Add New Product
          </h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Fill in the details below to add a product to your store
          </p>
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-2xl p-8 shadow-card">
        <ProductForm
          categories={categories}
          onSubmit={handleSubmit}
          submitLabel="Create Product"
          isLoading={isSubmitting}
          defaultValues={defaultCategoryId ? { categoryId: defaultCategoryId } : undefined}
        />
      </div>
    </div>
  );
}
