import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { mapCategory } from "@/lib/supabase/mappers";
import NewProductContent from "./NewProductContent";

interface Props {
  searchParams: { category?: string };
}

export default async function NewProductPage({ searchParams }: Props) {
  const supabase = createClient();

  // Server-side admin guard (same pattern as all other admin pages)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "ADMIN") redirect("/");

  const { data: catRows } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  const categories = (catRows ?? []).map((r) => mapCategory(r as Record<string, unknown>));

  // If ?category=<slug> was passed (from the category section "Add" button),
  // resolve it to a category ID so the form can pre-select it.
  const defaultCategoryId = searchParams.category
    ? (categories.find((c) => c.slug === searchParams.category)?.id ?? "")
    : "";

  return (
    <NewProductContent
      categories={categories}
      defaultCategoryId={defaultCategoryId}
    />
  );
}
