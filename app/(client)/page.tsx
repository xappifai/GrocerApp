import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { mapProduct, mapCategory } from "@/lib/supabase/mappers";
import { APP_NAME, APP_DESCRIPTION } from "@/lib/constants";
import HomeContent from "./HomeContent";

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
  openGraph: {
    title: APP_NAME,
    description: APP_DESCRIPTION,
    type: "website",
  },
};

const LIMIT = 8;

export default async function HomePage() {
  const supabase = createClient();

  // Fetch first page of products + all categories in parallel (server-side)
  const [productsRes, categoriesRes] = await Promise.all([
    supabase
      .from("products")
      .select("*, categories(*)", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(0, LIMIT - 1),
    supabase.from("categories").select("*").order("name"),
  ]);

  const products   = (productsRes.data   ?? []).map((r) => mapProduct(r as Record<string, unknown>));
  const categories = (categoriesRes.data ?? []).map((r) => mapCategory(r as Record<string, unknown>));
  const total      = productsRes.count ?? 0;

  return (
    <HomeContent
      initialProducts={products}
      initialCategories={categories}
      initialTotalPages={Math.ceil(total / LIMIT)}
      initialTotal={total}
    />
  );
}
