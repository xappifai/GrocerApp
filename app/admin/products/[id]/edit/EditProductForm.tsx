"use client";

import { useRouter } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { productService } from "@/services/productService";
import type { Product, CreateProductInput } from "@/types";
import toast from "react-hot-toast";

interface Props {
  product: Product;
}

export default function EditProductForm({ product }: Props) {
  const router = useRouter();

  const handleSubmit = async (data: CreateProductInput) => {
    await productService.update(product.id, data);
    toast.success("Product updated successfully!");
    router.push("/admin/products");
    router.refresh();
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
      onSubmit={handleSubmit}
      defaultValues={defaultValues}
      submitLabel="Save Changes"
      isEdit
    />
  );
}
