import type { Product, Category, Order, OrderItem } from "@/types";

export function mapCategory(row: Record<string, unknown>): Category {
  return {
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    image: (row.image as string) || undefined,
  };
}

export function mapProduct(row: Record<string, unknown>): Product {
  const cat = row.categories as Record<string, unknown> | null;
  return {
    id: row.id as string,
    name: row.name as string,
    description: (row.description as string) || "",
    price: Number(row.price),
    image: (row.image as string) || "",
    stock: row.stock as number,
    categoryId: row.category_id as string,
    category: cat
      ? {
          id: cat.id as string,
          name: cat.name as string,
          slug: cat.slug as string,
          image: (cat.image as string) || undefined,
        }
      : { id: "", name: "Uncategorised", slug: "" },
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export function mapOrderItem(row: Record<string, unknown>): OrderItem {
  return {
    id: row.id as string,
    productId: (row.product_id as string) || "",
    product: {
      id: (row.product_id as string) || "",
      name: row.product_name as string,
      description: "",
      price: Number(row.price),
      image: (row.product_image as string) || "",
      stock: 0,
      categoryId: "",
      category: { id: "", name: "", slug: "" },
      createdAt: "",
      updatedAt: "",
    },
    quantity: row.quantity as number,
    price: Number(row.price),
  };
}

export function mapOrder(row: Record<string, unknown>): Order {
  const items = (row.order_items as Record<string, unknown>[] | null) ?? [];
  return {
    id: row.id as string,
    status: row.status as Order["status"],
    totalPrice: Number(row.total_price),
    userId: (row.user_id as string) || "",
    user: {
      id: (row.user_id as string) || "",
      name: row.user_name as string,
      email: row.user_email as string,
      role: "CLIENT",
      createdAt: row.created_at as string,
    },
    items: items.map(mapOrderItem),
    deliveryAddress:   row.delivery_address as string,
    deliveryCity:      row.delivery_city    as string,
    deliveryPhone:     row.delivery_phone   as string,
    deliveryLatitude:  row.latitude  != null ? Number(row.latitude)  : null,
    deliveryLongitude: row.longitude != null ? Number(row.longitude) : null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}
