import { useState, useEffect, useCallback } from "react";
import { productService } from "@/services/productService";
import { Product, Category } from "@/types";
import toast from "react-hot-toast";

interface UseProductsOptions {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export function useProducts(options: UseProductsOptions = {}) {
  const { search = "", category = "", page = 1, limit = 8 } = options;

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await productService.getAll({ search, category, page, limit });
      setProducts(res.data);
      setTotal(res.total);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load products";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [search, category, page, limit]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const totalPages = Math.ceil(total / limit);

  return { products, total, totalPages, loading, error, refetch: fetch };
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productService
      .getCategories()
      .then(setCategories)
      .catch(() => toast.error("Failed to load categories"))
      .finally(() => setLoading(false));
  }, []);

  return { categories, loading };
}
