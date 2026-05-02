import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createClient } from "@/lib/supabase/client";
import type { CartItem, Product } from "@/types";

interface CartStore {
  items: CartItem[];
  isOpen: boolean;

  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  /**
   * Re-fetches live price/stock for every item currently in the cart.
   * - Items whose product no longer exists are silently removed.
   * - Items whose quantity exceeds current stock are capped.
   * Call this when the cart drawer opens or the checkout page mounts.
   */
  refreshCart: () => Promise<void>;

  // Computed
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product, quantity = 1) => {
        set((state) => {
          const existingIdx = state.items.findIndex((i) => i.product.id === product.id);
          if (existingIdx >= 0) {
            const updated = [...state.items];
            updated[existingIdx] = {
              ...updated[existingIdx],
              quantity: Math.min(
                updated[existingIdx].quantity + quantity,
                product.stock
              ),
            };
            return { items: updated };
          }
          return { items: [...state.items, { product, quantity: Math.min(quantity, product.stock) }] };
        });
      },

      removeItem: (productId) => {
        set((state) => ({ items: state.items.filter((i) => i.product.id !== productId) }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.product.id === productId
              ? { ...i, quantity: Math.min(quantity, i.product.stock) }
              : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

      refreshCart: async () => {
        const current = get().items;
        if (current.length === 0) return;

        const supabase = createClient();
        const ids = current.map((i) => i.product.id);

        const { data: fresh } = await supabase
          .from("products")
          .select("id, name, description, price, image, stock, category_id, created_at, updated_at, categories(id, name, slug, image)")
          .in("id", ids);

        if (!fresh) return; // keep stale rather than silently wipe on network error

        const freshMap = new Map(fresh.map((p) => [p.id, p]));

        const updated: CartItem[] = [];
        for (const item of current) {
          const liveData = freshMap.get(item.product.id);
          if (!liveData) continue; // product deleted — drop from cart

          type CategoryRow = { id: string; name: string; slug: string; image?: string | null } | null;
          // Supabase returns the joined row as an object (not array) for FK relations
          const cat = (liveData.categories as unknown as CategoryRow);
          const liveProduct: Product = {
            id:          liveData.id,
            name:        liveData.name,
            description: liveData.description ?? "",
            price:       Number(liveData.price),
            image:       liveData.image ?? "",
            stock:       liveData.stock,
            categoryId:  liveData.category_id ?? "",
            category: {
              id:    cat?.id   ?? "",
              name:  cat?.name ?? "",
              slug:  cat?.slug ?? "",
              image: cat?.image ?? undefined,
            },
            createdAt: liveData.created_at,
            updatedAt: liveData.updated_at,
          };

          // Cap quantity to current live stock
          const safeQty = Math.min(item.quantity, liveData.stock);
          if (safeQty > 0) {
            updated.push({ product: liveProduct, quantity: safeQty });
          }
        }

        set({ items: updated });
      },

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: () =>
        get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
    }),
    {
      name: "grocer-cart",
      partialize: (state) => ({ items: state.items }),
    }
  )
);
