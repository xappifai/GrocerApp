import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { mapOrder } from "@/lib/supabase/mappers";
import { APP_NAME } from "@/lib/constants";
import OrdersContent from "./OrdersContent";

export const metadata: Metadata = {
  title: `My Orders | ${APP_NAME}`,
  description: "View and track your order history.",
  robots: { index: false },
};

const ORDER_SELECT = `
  *,
  order_items (
    id, order_id, product_id,
    product_name, product_image,
    quantity, price
  )
`;

export default async function OrdersPage() {
  const supabase = createClient();

  // Server-side auth check — redirect if not logged in
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/orders");

  // Fetch this user's orders server-side (true SSR)
  const { data } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const orders = (data ?? []).map((r) => mapOrder(r as Record<string, unknown>));

  return <OrdersContent initialOrders={orders} />;
}
