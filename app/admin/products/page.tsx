import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { mapProduct } from "@/lib/supabase/mappers";
import AdminProductsContent from "./AdminProductsContent";

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

  const { data } = await supabase
    .from("products")
    .select("*, categories(*)")
    .order("created_at", { ascending: false });

  const products = (data ?? []).map((r) => mapProduct(r as Record<string, unknown>));

  return <AdminProductsContent initialProducts={products} />;
}
