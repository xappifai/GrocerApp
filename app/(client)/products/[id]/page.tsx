import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Star, Package } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { mapProduct } from "@/lib/supabase/mappers";
import { imageUrl } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";
import ProductActions from "./ProductActions";

export const revalidate = 60;

// Pre-render all product pages at build time; new ones rendered on first request.
export async function generateStaticParams() {
  const supabase = createClient();
  const { data } = await supabase.from("products").select("id");
  return (data ?? []).map((p) => ({ id: p.id as string }));
}

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createClient();
  const { data } = await supabase
    .from("products")
    .select("name, description, image")
    .eq("id", params.id)
    .single();

  // Return 404 metadata so crawlers receive a proper 404 status,
  // not a 200 with a "not found" title.
  if (!data) notFound();

  return {
    title: data.name as string,
    description: data.description as string,
    openGraph: {
      title: `${data.name} | ${APP_NAME}`,
      description: data.description as string,
      images: data.image ? [{ url: imageUrl(data.image as string), alt: data.name as string }] : [],
      type: "website",
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(*)")
    .eq("id", params.id)
    .single();

  if (error || !data) notFound();

  const product = mapProduct(data as Record<string, unknown>);
  const isOutOfStock = product.stock === 0;

  return (
    <div className="max-w-5xl mx-auto">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to shop
      </Link>

      <div className="grid gap-10 md:grid-cols-2 xl:gap-16">
        {/* Image — server-rendered */}
        <div className="relative aspect-square overflow-hidden rounded-3xl bg-gray-50">
          <Image
            src={imageUrl(product.image)}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <span className="rounded-full bg-white px-4 py-2 font-semibold text-gray-700">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Details — server-rendered for SEO */}
        <div className="flex flex-col gap-5 xl:justify-center">
          <div>
            <span className="text-sm font-medium text-brand-600">
              {product.category.name}
            </span>
            <h1 className="mt-1 font-display text-3xl font-bold text-gray-900">
              {product.name}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <div
              className="flex"
              role="img"
              aria-label="Rating: 4 out of 5 stars"
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  aria-hidden="true"
                  className={`h-4 w-4 ${
                    i < 4 ? "fill-amber-400 text-amber-400" : "text-gray-200"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500" aria-hidden="true">(4.0)</span>
          </div>

          <p className="text-gray-600 leading-relaxed">{product.description}</p>

          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-gray-400" />
            <span
              className={`text-sm font-medium ${
                product.stock > 10
                  ? "text-brand-600"
                  : product.stock > 0
                  ? "text-amber-600"
                  : "text-red-600"
              }`}
            >
              {product.stock > 10
                ? `${product.stock} in stock`
                : product.stock > 0
                ? `Only ${product.stock} left!`
                : "Out of stock"}
            </span>
          </div>

          {/* Client component: price display + cart controls */}
          <ProductActions product={product} />
        </div>
      </div>
    </div>
  );
}
