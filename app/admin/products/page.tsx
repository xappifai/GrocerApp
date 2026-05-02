import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { mapProduct, mapCategory } from "@/lib/supabase/mappers";
import AdminProductsContent from "./AdminProductsContent";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Products | Admin" };

export default async function AdminProductsPage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "ADMIN") redirect("/");

  // Fetch categories (alphabetical) and products in parallel
  const [{ data: catRows }, { data: productRows }] = await Promise.all([
    supabase.from("categories").select("*").order("name"),
    supabase
      .from("products")
      .select("*, categories(*)")
      .order("name")           // alphabetical within each category section
      .limit(500),
  ]);

  const categories = (catRows ?? []).map((r) => mapCategory(r as Record<string, unknown>));
  const products   = (productRows ?? []).map((r) => mapProduct(r as Record<string, unknown>));

  return <AdminProductsContent initialProducts={products} categories={categories} />;
}
