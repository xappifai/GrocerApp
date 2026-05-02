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
    // opengraph-image.tsx in this directory is auto-picked up by Next.js
  },
};

// Shape returned by the get_homepage_sections RPC
interface RpcRow {
  category_id:    string;
  category_name:  string;
  category_slug:  string;
  category_image: string | null;
  total:          number;
  products:       Record<string, unknown>[];
}

export default async function HomePage() {
  const supabase = createClient();

  // Single DB round-trip via RPC — replaces 1+N parallel queries.
  // Falls back to the old parallel strategy if the RPC isn't deployed yet.
  const { data: rpcRows, error: rpcError } = await supabase.rpc(
    "get_homepage_sections",
    { section_limit: 8 }
  );

  let sections: Section[];

  if (!rpcError && rpcRows) {
    // RPC path — one query, all data
    sections = (rpcRows as RpcRow[])
      .filter((row) => row.products?.length > 0)
      .map((row) => ({
        category: mapCategory({
          id:    row.category_id,
          name:  row.category_name,
          slug:  row.category_slug,
          image: row.category_image,
        }),
        products: (row.products ?? []).map((p) => mapProduct(p)),
        total:    Number(row.total),
      }));
  } else {
    // Fallback: parallel per-category queries (works before migration is run)
    const { data: catRows, error: catError } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    if (catError) throw new Error(`Failed to load categories: ${catError.message}`);

    const categories = (catRows ?? []).map((r) =>
      mapCategory(r as Record<string, unknown>)
    );

    sections = (
      await Promise.all(
        categories.map(async (cat) => {
          const { data, count, error } = await supabase
            .from("products")
            .select("*, categories(*)", { count: "exact" })
            .eq("category_id", cat.id)
            .order("created_at", { ascending: false })
            .limit(8);

          if (error) throw new Error(`Failed to load products for ${cat.name}: ${error.message}`);

          return {
            category: cat,
            products: (data ?? []).map((r) =>
              mapProduct(r as Record<string, unknown>)
            ),
            total: count ?? 0,
          };
        })
      )
    ).filter((s) => s.products.length > 0);
  }

  return <HomeContent sections={sections} />;
}
