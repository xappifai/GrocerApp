import { useState, useEffect, useCallback } from "react";
import { orderService } from "@/services/orderService";
import { Order, OrderStatus, CreateOrderInput } from "@/types";
import toast from "react-hot-toast";

export function useMyOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await orderService.getMyOrders();
      setOrders(data);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { orders, loading, refetch: fetch };
}

export function useAllOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await orderService.getAllOrders();
      setOrders(data);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const updateStatus = useCallback(
    async (orderId: string, status: OrderStatus) => {
      await orderService.updateStatus(orderId, status);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );
    },
    []
  );

  return { orders, loading, refetch: fetch, updateStatus };
}

export function usePlaceOrder() {
  const [loading, setLoading] = useState(false);

  const placeOrder = async (input: CreateOrderInput): Promise<Order | null> => {
    setLoading(true);
    try {
      const order = await orderService.create(input);
      return order;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to place order";
      toast.error(msg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { placeOrder, loading };
}
