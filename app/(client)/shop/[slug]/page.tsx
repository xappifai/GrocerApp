import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { mapProduct, mapCategory } from "@/lib/supabase/mappers";
import { APP_NAME } from "@/lib/constants";
import CategoryContent from "./CategoryContent";

export const revalidate = 60;

// Pre-render all known category pages at build time.
// New slugs added after deployment are rendered on-demand and then cached.
export async function generateStaticParams() {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = createClient();
  const { data } = await supabase.from("categories").select("slug");
  return (data ?? []).map((c) => ({ slug: c.slug as string }));
}

interface Props {
  params: { slug: string };
}

// ---------------------------------------------------------------------------
// generateMetadata — per-category SEO title & description
// ---------------------------------------------------------------------------
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createClient();
  const { data } = await supabase
    .from("categories")
    .select("name, slug")
    .eq("slug", params.slug)
    .single();

  if (!data) {
    return { title: `Category Not Found | ${APP_NAME}` };
  }

  const title = `${data.name} | ${APP_NAME}`;
  const description = `Shop all ${data.name} products at ${APP_NAME}. Fresh groceries delivered fast.`;

  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
  };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
const PAGE_LIMIT = 12;

export default async function CategoryPage({ params }: Props) {
  const supabase = createClient();

  // Fetch category by slug
  const { data: catRow, error: catError } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", params.slug)
    .single();

  if (catError || !catRow) notFound();

  const category = mapCategory(catRow as Record<string, unknown>);

  // Fetch first page of products + total count
  const { data: productRows, count, error: prodError } = await supabase
    .from("products")
    .select("*, categories(*)", { count: "exact" })
    .eq("category_id", category.id)
    .order("created_at", { ascending: false })
    .limit(PAGE_LIMIT);

  if (prodError) throw new Error(`Failed to load products: ${prodError.message}`);

  const products = (productRows ?? []).map((r) =>
    mapProduct(r as Record<string, unknown>)
  );
  const total      = count ?? 0;
  const totalPages = Math.ceil(total / PAGE_LIMIT);

  return (
    <CategoryContent
      category={category}
      initialProducts={products}
      initialTotal={total}
      initialTotalPages={totalPages}
      pageLimit={PAGE_LIMIT}
    />
  );
}
