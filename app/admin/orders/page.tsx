import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { mapOrder } from "@/lib/supabase/mappers";
import AdminOrdersContent from "./AdminOrdersContent";

const ORDER_SELECT = `
  *,
  order_items (
    id, order_id, product_id,
    product_name, product_image,
    quantity, price
  )
`;

export default async function AdminOrdersPage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "ADMIN") redirect("/");

  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .order("created_at", { ascending: false })
    .limit(500); // safety cap — paginate in AdminOrdersContent if needed

  if (error) throw new Error(`Failed to load orders: ${error.message}`);

  const orders = (data ?? []).map((r) => mapOrder(r as Record<string, unknown>));

  return <AdminOrdersContent initialOrders={orders} />;
}
