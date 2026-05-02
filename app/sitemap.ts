import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 3600; // regenerate sitemap at most once per hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://grocerapp.vercel.app";
  const now  = new Date().toISOString();

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`,        lastModified: now, changeFrequency: "daily",   priority: 1.0 },
    { url: `${base}/about`,   lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  const supabase = createClient();

  // Category pages — /shop/[slug]
  const { data: categories } = await supabase
    .from("categories")
    .select("slug, created_at");

  const categoryRoutes: MetadataRoute.Sitemap = (categories ?? []).map((cat) => ({
    url:             `${base}/shop/${cat.slug}`,
    lastModified:    cat.created_at as string,
    changeFrequency: "daily",
    priority:        0.8,
  }));

  // Product pages — /products/[id]
  const { data: products } = await supabase
    .from("products")
    .select("id, updated_at");

  const productRoutes: MetadataRoute.Sitemap = (products ?? []).map((p) => ({
    url:             `${base}/products/${p.id}`,
    lastModified:    p.updated_at as string,
    changeFrequency: "weekly",
    priority:        0.6,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
