"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import Input, { Textarea, Select } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { imageUrl } from "@/lib/utils";
import type { Category, CreateProductInput } from "@/types";

const schema = z.object({
  name:        z.string().min(2,  "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price:       z.coerce.number().positive("Price must be positive"),
  image:       z.string().url("Must be a valid URL").or(z.literal("")),
  stock:       z.coerce.number().int().min(0, "Stock cannot be negative"),
  categoryId:  z.string().min(1, "Please select a category"),
});

type FormData = z.infer<typeof schema>;

interface ProductFormProps {
  /** Pre-fetched categories from the server — eliminates the client-side loading spinner */
  categories:     Category[];
  defaultValues?: Partial<CreateProductInput>;
  onSubmit:       (data: CreateProductInput) => Promise<void>;
  submitLabel?:   string;
  isLoading?:     boolean;
  isEdit?:        boolean;
}

export default function ProductForm({
  categories,
  defaultValues,
  onSubmit,
  submitLabel,
  isLoading,
  isEdit,
}: ProductFormProps) {
  const [previewImage, setPreviewImage] = useState(defaultValues?.image ?? "");

  const categoryOptions = categories.map((c) => ({ label: c.name, value: c.id }));

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name:        defaultValues?.name        ?? "",
      description: defaultValues?.description ?? "",
      price:       defaultValues?.price       ?? 0,
      image:       defaultValues?.image       ?? "",
      stock:       defaultValues?.stock       ?? 0,
      categoryId:  defaultValues?.categoryId  ?? "",
    },
  });

  const watchedImage = watch("image");

  useEffect(() => {
    const t = setTimeout(() => setPreviewImage(watchedImage ?? ""), 500);
    return () => clearTimeout(t);
  }, [watchedImage]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Name */}
        <div className="sm:col-span-2">
          <Input
            label="Product Name"
            placeholder="e.g. Organic Bananas"
            error={errors.name?.message}
            required
            {...register("name")}
          />
        </div>

        {/* Description */}
        <div className="sm:col-span-2">
          <Textarea
            label="Description"
            placeholder="Describe the product..."
            rows={3}
            error={errors.description?.message}
            required
            {...register("description")}
          />
        </div>

        {/* Price */}
        <Input
          label="Price (PKR)"
          type="number"
          step="0.01"
          placeholder="0.00"
          error={errors.price?.message}
          required
          {...register("price")}
        />

        {/* Stock */}
        <Input
          label="Stock Quantity"
          type="number"
          placeholder="0"
          error={errors.stock?.message}
          required
          {...register("stock")}
        />

        {/* Category */}
        <Select
          label="Category"
          placeholder="Select a category"
          options={categoryOptions}
          error={errors.categoryId?.message}
          required
          {...register("categoryId")}
        />

        {/* Image URL */}
        <Input
          label="Image URL"
          type="url"
          placeholder="https://..."
          error={errors.image?.message}
          hint="Paste a direct image URL"
          {...register("image")}
        />
      </div>

      {/* Image Preview */}
      {previewImage ? (
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
          <p className="mb-2 text-xs font-medium text-gray-500">Image Preview</p>
          <div className="relative h-40 w-full overflow-hidden rounded-lg bg-gray-100">
            <Image
              src={imageUrl(previewImage)}
              alt="Preview"
              fill
              className="object-cover"
              sizes="500px"
              onError={() => setPreviewImage("")}
            />
          </div>
        </div>
      ) : (
        <div className="flex h-32 items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50">
          <div className="text-center">
            <ImageIcon className="mx-auto mb-1 h-6 w-6 text-gray-300" />
            <p className="text-xs text-gray-400">Image preview will appear here</p>
          </div>
        </div>
      )}

      <Button type="submit" isLoading={isLoading} fullWidth size="lg">
        {submitLabel ?? (isEdit ? "Update Product" : "Create Product")}
      </Button>
    </form>
  );
}
