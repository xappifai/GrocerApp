"use server";

import { revalidatePath } from "next/cache";

/**
 * Call this after any product create / update / delete to bust ISR caches:
 *  - The specific product detail page
 *  - The category page that lists the product
 *  - The homepage (uses ISR-cached RPC data)
 *
 * @param productId   UUID of the affected product (optional on create before ID is known)
 * @param categorySlug  slug of the category the product belongs to (optional)
 */
export async function revalidateProductCaches(
  productId?: string,
  categorySlug?: string
) {
  // Homepage — category sections are ISR-cached
  revalidatePath("/");

  // Product detail page
  if (productId) {
    revalidatePath(`/products/${productId}`);
  }

  // Category listing page
  if (categorySlug) {
    revalidatePath(`/shop/${categorySlug}`);
  }

  // Admin products list (server component)
  revalidatePath("/admin/products");
}
