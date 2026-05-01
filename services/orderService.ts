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

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("You must be logged in to place an order.");

    // Fetch profile for user name/email
    const { data: profile } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", user.id)
      .single();

    // Fetch current prices to calculate total
    const productIds = input.items.map((i) => i.productId);
    const { data: products, error: prodError } = await supabase
      .from("products")
      .select("id, price, stock")
      .in("id", productIds);
    if (prodError) throw new Error(prodError.message);

    const priceMap = new Map(
      (products ?? []).map((p) => [p.id as string, { price: Number(p.price), stock: p.stock as number }])
    );

    // Validate stock
    for (const item of input.items) {
      const p = priceMap.get(item.productId);
      if (!p) throw new Error(`Product ${item.productId} not found.`);
      if (p.stock < item.quantity) throw new Error(`Insufficient stock for one or more items.`);
    }

    const totalPrice = input.items.reduce((sum, item) => {
      return sum + (priceMap.get(item.productId)?.price ?? 0) * item.quantity;
    }, 0);

    // Insert order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id:          user.id,
        user_name:        profile?.name || user.user_metadata?.name || "",
        user_email:       user.email!,
        status:           "PENDING",
        total_price:      totalPrice,
        delivery_address: input.deliveryAddress,
        delivery_city:    input.deliveryCity,
        delivery_phone:   input.deliveryPhone,
        latitude:         input.deliveryLatitude  ?? null,
        longitude:        input.deliveryLongitude ?? null,
      })
      .select("id")
      .single();
    if (orderError) throw new Error(orderError.message);

    // Insert order items (snapshot of product data)
    const { data: productDetails } = await supabase
      .from("products")
      .select("id, name, image")
      .in("id", productIds);

    const nameMap = new Map(
      (productDetails ?? []).map((p) => [p.id as string, { name: p.name as string, image: (p.image as string) || "" }])
    );

    const orderItems = input.items.map((item) => ({
      order_id:      order.id,
      product_id:    item.productId,
      product_name:  nameMap.get(item.productId)?.name  ?? "",
      product_image: nameMap.get(item.productId)?.image ?? "",
      quantity:      item.quantity,
      price:         priceMap.get(item.productId)?.price ?? 0,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);
    if (itemsError) throw new Error(itemsError.message);

    // Return the complete order
    const { data: full, error: fetchError } = await supabase
      .from("orders")
      .select(ORDER_SELECT)
      .eq("id", order.id)
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

  async getAllOrders(): Promise<Order[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("orders")
      .select(ORDER_SELECT)
      .order("created_at", { ascending: false });

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
