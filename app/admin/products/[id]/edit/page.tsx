import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { mapProduct, mapCategory } from "@/lib/supabase/mappers";
import EditProductForm from "./EditProductForm";

interface Props {
  params: { id: string };
}

export default async function EditProductPage({ params }: Props) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "ADMIN") redirect("/");

  // Fetch product + categories in parallel
  const [{ data, error }, { data: catRows }] = await Promise.all([
    supabase.from("products").select("*, categories(*)").eq("id", params.id).single(),
    supabase.from("categories").select("*").order("name"),
  ]);

  if (error || !data) notFound();

  const product    = mapProduct(data as Record<string, unknown>);
  const categories = (catRows ?? []).map((r) => mapCategory(r as Record<string, unknown>));

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/products"
          className="p-2 rounded-lg text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold font-display text-neutral-900">Edit Product</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Updating: <span className="font-medium text-neutral-700">{product.name}</span>
          </p>
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-2xl p-8 shadow-card">
        <EditProductForm product={product} categories={categories} />
      </div>
    </div>
  );
}
