import { createClient } from "@/lib/supabase/client";
import { mapProduct, mapCategory } from "@/lib/supabase/mappers";
import type {
  Product,
  Category,
  CreateProductInput,
  UpdateProductInput,
  PaginatedResponse,
} from "@/types";

/**
 * Escape ILIKE special characters so user input cannot cause
 * catastrophic backtracking via uncontrolled wildcard patterns.
 * Postgres ILIKE treats % (any sequence) and _ (any char) as wildcards.
 */
function escapeLike(term: string): string {
  return term.replace(/[%_\\]/g, "\\$&");
}

export const productService = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
  }): Promise<PaginatedResponse<Product>> {
    const supabase = createClient();
    const page  = params?.page  ?? 1;
    const limit = params?.limit ?? 12;
    const from  = (page - 1) * limit;
    const to    = from + limit - 1;

    let categoryId: string | null = null;

    // Resolve category slug → id (one lightweight query)
    if (params?.category && params.category !== "all") {
      const { data: cat } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", params.category)
        .single();
      if (!cat) {
        return { data: [], total: 0, page, limit, totalPages: 0 };
      }
      categoryId = cat.id as string;
    }

    let query = supabase
      .from("products")
      .select("*, categories(*)", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (categoryId) {
      query = query.eq("category_id", categoryId);
    }

    if (params?.search?.trim()) {
      const term = escapeLike(params.search.trim());
      query = query.or(
        `name.ilike.%${term}%,description.ilike.%${term}%`
      );
    }

    const { data, count, error } = await query;
    if (error) throw new Error(error.message);

    return {
      data: (data ?? []).map((r) => mapProduct(r as Record<string, unknown>)),
      total: count ?? 0,
      page,
      limit,
      totalPages: Math.ceil((count ?? 0) / limit),
    };
  },

  async getById(id: string): Promise<Product> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*, categories(*)")
      .eq("id", id)
      .single();
    if (error) throw new Error(error.message);
    return mapProduct(data as Record<string, unknown>);
  },

  async create(input: CreateProductInput): Promise<Product> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("products")
      .insert({
        name:        input.name,
        description: input.description,
        price:       input.price,
        image:       input.image,
        stock:       input.stock,
        category_id: input.categoryId,
      })
      .select("*, categories(*)")
      .single();
    if (error) throw new Error(error.message);
    return mapProduct(data as Record<string, unknown>);
  },

  async update(id: string, input: UpdateProductInput): Promise<void> {
    const supabase = createClient();
    const patch: Record<string, unknown> = {};
    if (input.name        !== undefined) patch.name        = input.name;
    if (input.description !== undefined) patch.description = input.description;
    if (input.price       !== undefined) patch.price       = input.price;
    if (input.image       !== undefined) patch.image       = input.image;
    if (input.stock       !== undefined) patch.stock       = input.stock;
    if (input.categoryId  !== undefined) patch.category_id = input.categoryId;

    // Only check for errors — no SELECT needed since the caller already has
    // the product data and navigates away immediately after save.
    const { error } = await supabase
      .from("products")
      .update(patch)
      .eq("id", id);
    if (error) throw new Error(error.message);
  },

  async delete(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw new Error(error.message);
  },

  async getCategories(): Promise<Category[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => mapCategory(r as Record<string, unknown>));
  },
};
