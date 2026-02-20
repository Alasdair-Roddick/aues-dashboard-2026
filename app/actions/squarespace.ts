"use server";

import { auth } from "@/auth";
import { db } from "@/app/db";
import { squarespaceOrderItems, squarespaceOrders } from "@/app/db/schema";
import { and, count, desc, eq, ilike, inArray, max, or } from "drizzle-orm";
import {
  syncShirtOrdersToDatabase,
  getShirtOrdersFromDatabase,
  getShirtSizeCounts,
  fetchShirtOrders,
} from "@/app/lib/squarespace";
import { ActivityLogger } from "@/app/lib/activity";
import { getOrdersActivityWithUsers, type ActivityLogEntry } from "@/app/actions/activity";
import { getSessionRole } from "@/lib/session";

export type OrderStatus = "PENDING" | "PACKED" | "FULFILLED";

export type OrderActivity = {
  id: string;
  userName: string | null;
  userImage?: string | null;
  action: string;
  details: Record<string, unknown> | null;
  createdAt: Date;
};

type OrderItemRow = typeof squarespaceOrderItems.$inferSelect;
type PreviewOrder = Awaited<ReturnType<typeof fetchShirtOrders>>[number];


function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}

export type ShippingStatus = "PENDING" | "SHIPPED";

export type ShirtOrder = {
  id: string;
  orderNumber: string | null;
  customerEmail: string;
  customerName: string;
  fulfillmentStatus: string;
  shippingStatus: string;
  shippingTrackingNumber: string | null;
  shippingCarrier: string | null;
  shippedAt: Date | null;
  createdOn: Date;
  syncedAt: Date;
  items: Array<{
    id: number;
    productName: string;
    quantity: number;
    size: string | null;
    imageUrl: string | null;
  }>;
  activity: OrderActivity[];
};

export type OrdersPageResult = {
  orders: ShirtOrder[];
  total: number;
  hasMore: boolean;
  statusCounts: Record<OrderStatus, number>;
  timestamp: number;
  serverVersion: string | null;
};

export async function syncSquarespaceOrders(): Promise<{
  success: boolean;
  added?: number;
  updated?: number;
  error?: string;
}> {
  try {
    const session = await auth();
    const userRole = await getSessionRole(session?.user);

    // All committee roles can sync orders (exclude Temporary)
    if (!session?.user || userRole === "Temporary" || !userRole) {
      return { success: false, error: "Unauthorized" };
    }

    const result = await syncShirtOrdersToDatabase();
    return { success: true, added: result.added, updated: result.updated };
  } catch (error: unknown) {
    console.error("Error syncing Squarespace orders:", error);
    return { success: false, error: getErrorMessage(error, "Failed to sync orders") };
  }
}

export async function getSquarespaceOrders(): Promise<ShirtOrder[]> {
  try {
    const session = await auth();
    const userRole = await getSessionRole(session?.user);

    // All committee roles can view orders (exclude Temporary)
    if (!session?.user || userRole === "Temporary" || !userRole) {
      return [];
    }

    const orders = await getShirtOrdersFromDatabase();

    // Fetch activity logs for all orders
    const orderIds = orders.map((o) => o.id);
    const activityByOrder = await getOrdersActivityWithUsers(orderIds);

    // Merge activity into orders
    return orders.map((order) => ({
      ...order,
      activity: (activityByOrder[order.id] || []).map((log) => ({
        id: log.id,
        userName: log.userName,
        userImage: log.userImage,
        action: log.action,
        details: log.details,
        createdAt: log.createdAt,
      })),
    }));
  } catch (error) {
    console.error("Error fetching Squarespace orders:", error);
    return [];
  }
}

export async function getSquarespaceOrdersVersion(): Promise<string | null> {
  try {
    const session = await auth();
    const userRole = await getSessionRole(session?.user);

    if (!session?.user || userRole === "Temporary" || !userRole) {
      return null;
    }

    const rows = await db
      .select({ value: max(squarespaceOrders.syncedAt) })
      .from(squarespaceOrders);

    return rows[0]?.value ? rows[0].value.toISOString() : null;
  } catch (error) {
    console.error("Error fetching Squarespace orders version:", error);
    return null;
  }
}

async function getOrderStatusCounts(): Promise<Record<OrderStatus, number>> {
  const counts: Record<OrderStatus, number> = {
    PENDING: 0,
    PACKED: 0,
    FULFILLED: 0,
  };

  const rows = await db
    .select({
      status: squarespaceOrders.fulfillmentStatus,
      total: count(),
    })
    .from(squarespaceOrders)
    .groupBy(squarespaceOrders.fulfillmentStatus);

  for (const row of rows) {
    const status = row.status as OrderStatus;
    if (status in counts) {
      counts[status] = Number(row.total) || 0;
    }
  }

  return counts;
}

export async function getSquarespaceOrdersPage(params: {
  status: OrderStatus;
  searchQuery?: string;
  limit?: number;
  offset?: number;
}): Promise<OrdersPageResult> {
  try {
    const session = await auth();
    const userRole = await getSessionRole(session?.user);

    // All committee roles can view orders (exclude Temporary)
    if (!session?.user || userRole === "Temporary" || !userRole) {
      return {
        orders: [],
        total: 0,
        hasMore: false,
        statusCounts: { PENDING: 0, PACKED: 0, FULFILLED: 0 },
        timestamp: Date.now(),
        serverVersion: null,
      };
    }

    const statusCountsPromise = getOrderStatusCounts();
    const serverVersionPromise = db
      .select({ value: max(squarespaceOrders.syncedAt) })
      .from(squarespaceOrders);
    const trimmedQuery = params.searchQuery?.trim() || "";
    const limit = Math.min(Math.max(params.limit ?? 40, 1), 100);
    const offset = Math.max(params.offset ?? 0, 0);

    let matchingOrderIds: string[] | null = null;

    if (trimmedQuery.length > 0) {
      const pattern = `%${trimmedQuery}%`;

      const [orderMatches, itemMatches] = await Promise.all([
        db
          .select({ id: squarespaceOrders.id })
          .from(squarespaceOrders)
          .where(
            or(
              ilike(squarespaceOrders.customerName, pattern),
              ilike(squarespaceOrders.customerEmail, pattern),
              ilike(squarespaceOrders.orderNumber, pattern),
              ilike(squarespaceOrders.id, pattern),
            ),
          ),
        db
          .selectDistinct({ orderId: squarespaceOrderItems.orderId })
          .from(squarespaceOrderItems)
          .where(
            or(
              ilike(squarespaceOrderItems.productName, pattern),
              ilike(squarespaceOrderItems.size, pattern),
            ),
          ),
      ]);

      matchingOrderIds = Array.from(
        new Set([...orderMatches.map((row) => row.id), ...itemMatches.map((row) => row.orderId)]),
      );

      if (matchingOrderIds.length === 0) {
        const [statusCounts, serverVersionRows] = await Promise.all([
          statusCountsPromise,
          serverVersionPromise,
        ]);
        const serverVersion = serverVersionRows[0]?.value
          ? serverVersionRows[0].value.toISOString()
          : null;
        return {
          orders: [],
          total: 0,
          hasMore: false,
          statusCounts,
          timestamp: Date.now(),
          serverVersion,
        };
      }
    }

    const baseCondition = matchingOrderIds
      ? and(
          eq(squarespaceOrders.fulfillmentStatus, params.status),
          inArray(squarespaceOrders.id, matchingOrderIds),
        )
      : eq(squarespaceOrders.fulfillmentStatus, params.status);

    const [orders, totalRows, statusCounts, serverVersionRows] = await Promise.all([
      db
        .select()
        .from(squarespaceOrders)
        .where(baseCondition)
        .orderBy(desc(squarespaceOrders.createdOn))
        .limit(limit)
        .offset(offset),
      db.select({ total: count() }).from(squarespaceOrders).where(baseCondition),
      statusCountsPromise,
      serverVersionPromise,
    ]);
    const total = Number(totalRows[0]?.total ?? 0);
    const serverVersion = serverVersionRows[0]?.value
      ? serverVersionRows[0].value.toISOString()
      : null;

    const orderIds = orders.map((order) => order.id);
    let items: OrderItemRow[] = [];
    let activityByOrder: Record<string, ActivityLogEntry[]> = {};

    if (orderIds.length > 0) {
      [items, activityByOrder] = await Promise.all([
        db
          .select()
          .from(squarespaceOrderItems)
          .where(inArray(squarespaceOrderItems.orderId, orderIds)),
        getOrdersActivityWithUsers(orderIds),
      ]);
    }

    const itemsByOrder = items.reduce<Record<string, OrderItemRow[]>>((acc, item) => {
      if (!acc[item.orderId]) {
        acc[item.orderId] = [];
      }
      acc[item.orderId].push(item);
      return acc;
    }, {});

    const mappedOrders: ShirtOrder[] = orders.map((order) => ({
      ...order,
      items: itemsByOrder[order.id] || [],
      activity: (activityByOrder[order.id] || []).map((log) => ({
        id: log.id,
        userName: log.userName,
        userImage: log.userImage,
        action: log.action,
        details: log.details,
        createdAt: log.createdAt,
      })),
    }));

    return {
      orders: mappedOrders,
      total,
      hasMore: offset + mappedOrders.length < total,
      statusCounts,
      timestamp: Date.now(),
      serverVersion,
    };
  } catch (error) {
    console.error("Error fetching paginated Squarespace orders:", error);
    return {
      orders: [],
      total: 0,
      hasMore: false,
      statusCounts: { PENDING: 0, PACKED: 0, FULFILLED: 0 },
      timestamp: Date.now(),
      serverVersion: null,
    };
  }
}

export async function getShirtStats(): Promise<Record<string, Record<string, number>>> {
  try {
    const session = await auth();
    const userRole = await getSessionRole(session?.user);

    // All committee roles can view stats (exclude Temporary)
    if (!session?.user || userRole === "Temporary" || !userRole) {
      return {};
    }

    const counts = await getShirtSizeCounts();
    return counts;
  } catch (error) {
    console.error("Error fetching shirt stats:", error);
    return {};
  }
}

// Preview orders without saving to database
export async function previewSquarespaceOrders(): Promise<{
  success: boolean;
  orders?: PreviewOrder[];
  error?: string;
}> {
  try {
    const session = await auth();
    const userRole = await getSessionRole(session?.user);

    // All committee roles can preview orders (exclude Temporary)
    if (!session?.user || userRole === "Temporary" || !userRole) {
      return { success: false, error: "Unauthorized" };
    }

    const orders = await fetchShirtOrders();
    return { success: true, orders };
  } catch (error: unknown) {
    console.error("Error previewing Squarespace orders:", error);
    return { success: false, error: getErrorMessage(error, "Failed to fetch orders") };
  }
}

// Update order status
export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    const userRole = await getSessionRole(session?.user);
    const userId = (session?.user as { id?: string } | undefined)?.id;
    const userName = session?.user?.name;

    // All committee roles can update orders (exclude Temporary)
    if (!session?.user || !userId || userRole === "Temporary" || !userRole) {
      return { success: false, error: "Unauthorized" };
    }

    // Get current order to log the status change
    const currentOrder = await db
      .select()
      .from(squarespaceOrders)
      .where(eq(squarespaceOrders.id, orderId))
      .limit(1);

    if (currentOrder.length === 0) {
      return { success: false, error: "Order not found" };
    }

    const oldStatus = currentOrder[0].fulfillmentStatus;

    // Update the order status
    await db
      .update(squarespaceOrders)
      .set({
        fulfillmentStatus: newStatus,
        syncedAt: new Date(),
      })
      .where(eq(squarespaceOrders.id, orderId));

    // Log the activity
    await ActivityLogger.orderStatusUpdated(
      { id: userId, name: userName || "Unknown" },
      orderId,
      oldStatus,
      newStatus,
      currentOrder[0].customerName,
    );

    return { success: true };
  } catch (error: unknown) {
    console.error("Error updating order status:", error);
    return { success: false, error: getErrorMessage(error, "Failed to update order") };
  }
}

// Get orders with a timestamp for polling comparison
export async function getOrdersWithTimestamp(): Promise<{
  orders: ShirtOrder[];
  timestamp: number;
}> {
  const orders = await getSquarespaceOrders();
  return {
    orders,
    timestamp: Date.now(),
  };
}

// Delete an order
export async function deleteOrder(orderId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    const userRole = await getSessionRole(session?.user);

    // Only Admin can delete orders
    if (!session?.user || userRole !== "Admin") {
      return { success: false, error: "Unauthorized - Admin only" };
    }

    await db.delete(squarespaceOrders).where(eq(squarespaceOrders.id, orderId));

    return { success: true };
  } catch (error: unknown) {
    console.error("Error deleting order:", error);
    return { success: false, error: getErrorMessage(error, "Failed to delete order") };
  }
}

// Update shipping info
export async function updateShipping(
  orderId: string,
  trackingNumber: string,
  carrier: string = "auspost",
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    const userRole = await getSessionRole(session?.user);
    const userId = (session?.user as { id?: string } | undefined)?.id;
    const userName = session?.user?.name;

    // All committee roles can update shipping (exclude Temporary)
    if (!session?.user || !userId || userRole === "Temporary" || !userRole) {
      return { success: false, error: "Unauthorized" };
    }

    // Get current order
    const currentOrder = await db
      .select()
      .from(squarespaceOrders)
      .where(eq(squarespaceOrders.id, orderId))
      .limit(1);

    if (currentOrder.length === 0) {
      return { success: false, error: "Order not found" };
    }

    // Update shipping info
    await db
      .update(squarespaceOrders)
      .set({
        shippingStatus: "SHIPPED",
        shippingTrackingNumber: trackingNumber,
        shippingCarrier: carrier,
        shippedAt: new Date(),
        syncedAt: new Date(),
      })
      .where(eq(squarespaceOrders.id, orderId));

    // Log the activity
    await ActivityLogger.orderStatusUpdated(
      { id: userId, name: userName || "Unknown" },
      orderId,
      "SHIPPING",
      "SHIPPED",
      currentOrder[0].customerName,
    );

    return { success: true };
  } catch (error: unknown) {
    console.error("Error updating shipping:", error);
    return { success: false, error: getErrorMessage(error, "Failed to update shipping") };
  }
}
