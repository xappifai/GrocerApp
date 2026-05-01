"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ProductForm from "@/components/admin/ProductForm";
import { productService } from "@/services/productService";
import { CreateProductInput } from "@/types";
import toast from "react-hot-toast";

export default function NewProductPage() {
  const router = useRouter();

  const handleSubmit = async (data: CreateProductInput) => {
    await productService.create(data);
    toast.success("Product created successfully!");
    router.push("/admin/products");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
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

      {/* Card */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-8 shadow-card">
        <ProductForm onSubmit={handleSubmit} submitLabel="Create Product" />
      </div>
    </div>
  );
}
