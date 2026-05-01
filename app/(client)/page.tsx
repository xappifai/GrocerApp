import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { mapProduct, mapCategory } from "@/lib/supabase/mappers";
import { APP_NAME, APP_DESCRIPTION } from "@/lib/constants";
import HomeContent from "./HomeContent";
import type { Section } from "./HomeContent";

export const revalidate = 60;

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
  openGraph: {
    title: APP_NAME,
    description: APP_DESCRIPTION,
    type: "website",
  },
};

export default async function HomePage() {
  const supabase = createClient();

  // 1. Fetch all categories
  const { data: catRows } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  const categories = (catRows ?? []).map((r) =>
    mapCategory(r as Record<string, unknown>)
  );

  // 2. Fetch 8 products + total count per category — all in parallel
  const sections: Section[] = (
    await Promise.all(
      categories.map(async (cat) => {
        const { data, count } = await supabase
          .from("products")
          .select("*, categories(*)", { count: "exact" })
          .eq("category_id", cat.id)
          .order("created_at", { ascending: false })
          .limit(8);

        return {
          category: cat,
          products: (data ?? []).map((r) =>
            mapProduct(r as Record<string, unknown>)
          ),
          total: count ?? 0,
        };
      })
    )
  ).filter((s) => s.products.length > 0); // drop empty categories

  return <HomeContent sections={sections} />;
}
