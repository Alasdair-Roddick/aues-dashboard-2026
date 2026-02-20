import { create } from "zustand";
import {
  getSquarespaceOrdersPage,
  getSquarespaceOrdersVersion,
  updateOrderStatus,
  syncSquarespaceOrders,
  deleteOrder,
  updateShipping,
  type ShirtOrder,
  type OrderStatus,
} from "@/app/actions/squarespace";

const DEFAULT_PAGE_SIZE = 40;

const EMPTY_COUNTS: Record<OrderStatus, number> = {
  PENDING: 0,
  PACKED: 0,
  FULFILLED: 0,
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}

function mergeOrders(existing: ShirtOrder[], incoming: ShirtOrder[]): ShirtOrder[] {
  const byId = new Map(existing.map((order) => [order.id, order]));

  for (const order of incoming) {
    byId.set(order.id, order);
  }

  return Array.from(byId.values());
}

type ShirtOrderStore = {
  orders: ShirtOrder[];
  loading: boolean;
  loadingMore: boolean;
  syncing: boolean;
  activeMutations: number;
  lastUpdated: number | null;
  pollingInterval: NodeJS.Timeout | null;
  searchQuery: string;
  activeStatus: OrderStatus;
  pageSize: number;
  hasMore: boolean;
  totalForActive: number;
  statusCounts: Record<OrderStatus, number>;
  serverVersion: string | null;
  activeRequestId: number;

  // Actions
  fetchOrders: (options?: {
    reset?: boolean;
    silent?: boolean;
    limitOverride?: number;
  }) => Promise<void>;
  loadMore: () => Promise<void>;
  setActiveStatus: (status: OrderStatus) => void;
  syncOrders: () => Promise<{ success: boolean; added?: number; updated?: number; error?: string }>;
  updateStatus: (
    orderId: string,
    newStatus: OrderStatus,
  ) => Promise<{ success: boolean; error?: string }>;
  removeOrder: (orderId: string) => Promise<{ success: boolean; error?: string }>;
  setShipping: (
    orderId: string,
    trackingNumber: string,
    carrier?: string,
  ) => Promise<{ success: boolean; error?: string }>;
  setSearchQuery: (query: string) => void;

  // Polling
  startPolling: (intervalMs?: number) => void;
  stopPolling: () => void;

  // Compatibility helpers
  getFilteredOrders: () => ShirtOrder[];
  getOrdersByStatus: (status: OrderStatus) => ShirtOrder[];
};

export const useShirtOrderStore = create<ShirtOrderStore>((set, get) => ({
  orders: [],
  loading: true,
  loadingMore: false,
  syncing: false,
  activeMutations: 0,
  lastUpdated: null,
  pollingInterval: null,
  searchQuery: "",
  activeStatus: "PENDING",
  pageSize: DEFAULT_PAGE_SIZE,
  hasMore: false,
  totalForActive: 0,
  statusCounts: EMPTY_COUNTS,
  serverVersion: null,
  activeRequestId: 0,

  fetchOrders: async (options) => {
    const state = get();
    const reset = options?.reset ?? true;
    const silent = options?.silent ?? false;

    if (!reset && (!state.hasMore || state.loadingMore || state.loading)) {
      return;
    }

    const limit = options?.limitOverride ?? state.pageSize;
    const offset = reset ? 0 : state.orders.length;
    const requestId = state.activeRequestId + 1;
    const loadingState = silent
      ? {}
      : reset
        ? { loading: true, loadingMore: false }
        : { loadingMore: true };

    set({
      activeRequestId: requestId,
      ...loadingState,
    });

    try {
      const result = await getSquarespaceOrdersPage({
        status: get().activeStatus,
        searchQuery: get().searchQuery,
        limit,
        offset,
      });

      if (get().activeRequestId !== requestId) {
        return;
      }

      set((current) => ({
        orders: reset ? result.orders : mergeOrders(current.orders, result.orders),
        totalForActive: result.total,
        hasMore: result.hasMore,
        statusCounts: result.statusCounts,
        serverVersion: result.serverVersion,
        lastUpdated: result.timestamp,
      }));
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      if (get().activeRequestId === requestId) {
        set({ loading: false, loadingMore: false });
      }
    }
  },

  loadMore: async () => {
    await get().fetchOrders({ reset: false });
  },

  setActiveStatus: (status: OrderStatus) => {
    set({ activeStatus: status, orders: [], hasMore: false, totalForActive: 0 });
  },

  syncOrders: async () => {
    set({ syncing: true });
    try {
      const result = await syncSquarespaceOrders();
      if (result.success) {
        await get().fetchOrders({ reset: true });
      }
      set({ syncing: false });
      return result;
    } catch (error: unknown) {
      set({ syncing: false });
      return { success: false, error: getErrorMessage(error) };
    }
  },

  updateStatus: async (orderId: string, newStatus: OrderStatus) => {
    const previousOrders = get().orders;
    set((state) => ({
      activeMutations: state.activeMutations + 1,
      orders: previousOrders.map((order) =>
        order.id === orderId ? { ...order, fulfillmentStatus: newStatus } : order,
      ),
    }));

    try {
      const result = await updateOrderStatus(orderId, newStatus);

      if (!result.success) {
        set({ orders: previousOrders });
      } else {
        await get().fetchOrders({
          reset: true,
          silent: true,
          limitOverride: Math.max(get().orders.length, get().pageSize),
        });
      }

      return result;
    } catch (error: unknown) {
      set({ orders: previousOrders });
      return { success: false, error: getErrorMessage(error) };
    } finally {
      set((state) => ({
        activeMutations: Math.max(0, state.activeMutations - 1),
      }));
    }
  },

  removeOrder: async (orderId: string) => {
    const previousOrders = get().orders;
    set((state) => ({
      activeMutations: state.activeMutations + 1,
      orders: previousOrders.filter((order) => order.id !== orderId),
    }));

    try {
      const result = await deleteOrder(orderId);

      if (!result.success) {
        set({ orders: previousOrders });
      } else {
        await get().fetchOrders({
          reset: true,
          silent: true,
          limitOverride: Math.max(get().orders.length, get().pageSize),
        });
      }

      return result;
    } catch (error: unknown) {
      set({ orders: previousOrders });
      return { success: false, error: getErrorMessage(error) };
    } finally {
      set((state) => ({
        activeMutations: Math.max(0, state.activeMutations - 1),
      }));
    }
  },

  setShipping: async (orderId: string, trackingNumber: string, carrier: string = "auspost") => {
    const previousOrders = get().orders;
    set((state) => ({
      activeMutations: state.activeMutations + 1,
      orders: previousOrders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              shippingStatus: "SHIPPED",
              shippingTrackingNumber: trackingNumber,
              shippingCarrier: carrier,
              shippedAt: new Date(),
            }
          : order,
      ),
    }));

    try {
      const result = await updateShipping(orderId, trackingNumber, carrier);

      if (!result.success) {
        set({ orders: previousOrders });
      } else {
        await get().fetchOrders({
          reset: true,
          silent: true,
          limitOverride: Math.max(get().orders.length, get().pageSize),
        });
      }

      return result;
    } catch (error: unknown) {
      set({ orders: previousOrders });
      return { success: false, error: getErrorMessage(error) };
    } finally {
      set((state) => ({
        activeMutations: Math.max(0, state.activeMutations - 1),
      }));
    }
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  startPolling: (intervalMs = 15000) => {
    const currentInterval = get().pollingInterval;
    if (currentInterval) {
      clearInterval(currentInterval);
    }

    const interval = setInterval(async () => {
      const state = get();
      if (state.activeMutations > 0) {
        return;
      }

      const latestVersion = await getSquarespaceOrdersVersion();
      if (latestVersion === state.serverVersion) {
        return;
      }

      const loadedCount = Math.max(state.orders.length, state.pageSize);
      await get().fetchOrders({
        reset: true,
        silent: true,
        limitOverride: loadedCount,
      });
    }, intervalMs);

    set({ pollingInterval: interval });
  },

  stopPolling: () => {
    const interval = get().pollingInterval;
    if (interval) {
      clearInterval(interval);
      set({ pollingInterval: null });
    }
  },

  getFilteredOrders: () => get().orders,

  getOrdersByStatus: (status: OrderStatus) => {
    return status === get().activeStatus ? get().orders : [];
  },
}));
