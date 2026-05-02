"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { productService } from "@/services/productService";
import { revalidateProductCaches } from "@/app/admin/actions";
import type { Category, Product, CreateProductInput } from "@/types";
import toast from "react-hot-toast";

interface Props {
  product:    Product;
  categories: Category[];
}

export default function EditProductForm({ product, categories }: Props) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: CreateProductInput) => {
    setIsSubmitting(true);
    try {
      await productService.update(product.id, data);
      // Fire cache revalidation in the background — no need to block navigation on it.
      revalidateProductCaches(product.id, product.category.slug);
      toast.success("Product updated successfully!");
      router.push("/admin/products");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update product.");
      setIsSubmitting(false);
    }
  };

  const defaultValues: Partial<CreateProductInput> = {
    name:        product.name,
    description: product.description,
    price:       product.price,
    stock:       product.stock,
    categoryId:  product.categoryId,
    image:       product.image,
  };

  return (
    <ProductForm
      categories={categories}
      onSubmit={handleSubmit}
      defaultValues={defaultValues}
      submitLabel="Save Changes"
      isLoading={isSubmitting}
      isEdit
    />
  );
}
