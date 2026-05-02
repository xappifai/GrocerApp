import { createClient } from "@/lib/supabase/client";
import { mapOrder } from "@/lib/supabase/mappers";
import type { Order, CreateOrderInput, OrderStatus, DashboardStats } from "@/types";

const ORDER_SELECT = `
  *,
  order_items (
    id, order_id, product_id,
    product_name, product_image,
    quantity, price
  )
`;

export const orderService = {
  async create(input: CreateOrderInput): Promise<Order> {
    const supabase = createClient();

    // Verify the user is logged in
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("You must be logged in to place an order.");

    // Fetch display name for the order record
    const { data: profile } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", user.id)
      .single();

    // ---------------------------------------------------------------------------
    // Delegate the entire order to the place_order RPC which runs inside a single
    // Postgres transaction:
    //   - locks product rows (prevents concurrent over-selling)
    //   - validates stock per item
    //   - computes total price server-side (price tamper-proof)
    //   - inserts order + order_items atomically
    //   - decrements product.stock for every item
    // Any failure rolls back everything — no dangling orders.
    // ---------------------------------------------------------------------------
    const { data: orderId, error: rpcError } = await supabase.rpc("place_order", {
      p_user_id:          user.id,
      p_user_name:        profile?.name || (user.user_metadata?.name as string) || "",
      p_user_email:       user.email ?? "",
      p_delivery_address: input.deliveryAddress,
      p_delivery_city:    input.deliveryCity,
      p_delivery_phone:   input.deliveryPhone,
      p_latitude:         input.deliveryLatitude  ?? null,
      p_longitude:        input.deliveryLongitude ?? null,
      p_items: input.items.map((i) => ({
        product_id: i.productId,
        quantity:   i.quantity,
      })),
    });

    if (rpcError) throw new Error(rpcError.message);

    // Fetch the full order to return to the caller
    const { data: full, error: fetchError } = await supabase
      .from("orders")
      .select(ORDER_SELECT)
      .eq("id", orderId as string)
      .single();
    if (fetchError) throw new Error(fetchError.message);

    return mapOrder(full as Record<string, unknown>);
  },

  async getMyOrders(): Promise<Order[]> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("orders")
      .select(ORDER_SELECT)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => mapOrder(r as Record<string, unknown>));
  },

  async getAllOrders(limit = 500): Promise<Order[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("orders")
      .select(ORDER_SELECT)
      .order("created_at", { ascending: false })
      .limit(limit); // safety cap — default 500

    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => mapOrder(r as Record<string, unknown>));
  },

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id)
      .select(ORDER_SELECT)
      .single();

    if (error) throw new Error(error.message);
    return mapOrder(data as Record<string, unknown>);
  },

  async getDashboardStats(): Promise<DashboardStats> {
    const supabase = createClient();

    const [ordersRes, productsRes, customersRes] = await Promise.all([
      supabase.from("orders").select("id, status, total_price, created_at"),
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "CLIENT"),
    ]);

    const orders = ordersRes.data ?? [];
    const totalRevenue = orders
      .filter((o) => o.status === "DELIVERED")
      .reduce((sum, o) => sum + Number(o.total_price), 0);

    // Recent 5 orders with full data for display
    const { data: recentRaw } = await supabase
      .from("orders")
      .select(ORDER_SELECT)
      .order("created_at", { ascending: false })
      .limit(5);

    return {
      totalOrders:   orders.length,
      totalRevenue,
      totalProducts: productsRes.count ?? 0,
      totalCustomers: customersRes.count ?? 0,
      pendingOrders: orders.filter((o) => o.status === "PENDING").length,
      recentOrders:  (recentRaw ?? []).map((r) => mapOrder(r as Record<string, unknown>)),
    };
  },
};
