"use server";

import { db } from "@/app/db";
import { activityLog, users, members, squarespaceOrders, squarespaceOrderItems, ActivityActionType } from "@/app/db/schema";
import { auth } from "@/auth";
import { desc, eq, and, gte, lte, inArray } from "drizzle-orm";
import { getSessionRole } from "@/lib/session";

export type ActivityLogEntry = {
  id: string;
  userId: string | null;
  userName: string | null;
  userImage?: string | null;
  action: ActivityActionType;
  entityType: string | null;
  entityId: string | null;
  details: Record<string, unknown> | null;
  createdAt: Date;
};

interface GetActivityLogsParams {
  limit?: number;
  offset?: number;
  entityType?: string;
  entityId?: string;
  userId?: string;
  action?: ActivityActionType;
  startDate?: Date;
  endDate?: Date;
}

export async function getActivityLogs(params: GetActivityLogsParams = {}): Promise<{
  logs: ActivityLogEntry[];
  total: number;
}> {
  try {
    const session = await auth();
    const userRole = await getSessionRole(session?.user);

    // Only Admin can view activity logs
    if (!session?.user || userRole !== "Admin") {
      return { logs: [], total: 0 };
    }

    const {
      limit = 50,
      offset = 0,
      entityType,
      entityId,
      userId,
      action,
      startDate,
      endDate,
    } = params;

    // Build conditions array
    const conditions = [];

    if (entityType) {
      conditions.push(eq(activityLog.entityType, entityType));
    }
    if (entityId) {
      conditions.push(eq(activityLog.entityId, entityId));
    }
    if (userId) {
      conditions.push(eq(activityLog.userId, userId));
    }
    if (action) {
      conditions.push(eq(activityLog.action, action));
    }
    if (startDate) {
      conditions.push(gte(activityLog.createdAt, startDate));
    }
    if (endDate) {
      conditions.push(lte(activityLog.createdAt, endDate));
    }

    // Get logs with filters
    const logs = await db
      .select()
      .from(activityLog)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(activityLog.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count (simplified - for pagination)
    const allLogs = await db
      .select({ id: activityLog.id })
      .from(activityLog)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return {
      logs: logs as ActivityLogEntry[],
      total: allLogs.length,
    };
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    return { logs: [], total: 0 };
  }
}

// Get activity for a specific entity (e.g., all activity for an order)
export async function getEntityActivity(
  entityType: string,
  entityId: string,
): Promise<ActivityLogEntry[]> {
  try {
    const session = await auth();
    const userRole = await getSessionRole(session?.user);

    // Only Admin or Treasurer can view entity activity
    if (!session?.user || (userRole !== "Admin" && userRole !== "Treasurer")) {
      return [];
    }

    const logs = await db
      .select()
      .from(activityLog)
      .where(and(eq(activityLog.entityType, entityType), eq(activityLog.entityId, entityId)))
      .orderBy(desc(activityLog.createdAt));

    return logs as ActivityLogEntry[];
  } catch (error) {
    console.error("Error fetching entity activity:", error);
    return [];
  }
}

// Get recent activity for dashboard
export async function getRecentActivity(limit: number = 10): Promise<ActivityLogEntry[]> {
  try {
    const session = await auth();

    if (!session?.user) {
      return [];
    }

    const logs = await db
      .select()
      .from(activityLog)
      .orderBy(desc(activityLog.createdAt))
      .limit(limit);

    return logs as ActivityLogEntry[];
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    return [];
  }
}

// Unified dashboard feed item
export type DashboardFeedItem = {
  id: string;
  type: "activity" | "member" | "order";
  icon: string; // icon key for the frontend
  description: string;
  createdAt: Date;
};

// Get a unified dashboard feed combining activity logs, recent members, and recent orders
export async function getDashboardFeed(limit: number = 5): Promise<DashboardFeedItem[]> {
  try {
    const session = await auth();
    if (!session?.user) return [];

    // Fetch all three in parallel
    const [recentLogs, recentMembers, recentOrders] = await Promise.all([
      db.select().from(activityLog).orderBy(desc(activityLog.createdAt)).limit(limit),
      db.select({ id: members.id, fullname: members.fullname, createdAt: members.createdAt }).from(members).orderBy(desc(members.createdAt)).limit(limit),
      db
        .select({
          id: squarespaceOrders.id,
          customerName: squarespaceOrders.customerName,
          orderNumber: squarespaceOrders.orderNumber,
          createdOn: squarespaceOrders.createdOn,
        })
        .from(squarespaceOrders)
        .orderBy(desc(squarespaceOrders.createdOn))
        .limit(limit),
    ]);

    const feed: DashboardFeedItem[] = [];

    // Activity log entries
    for (const log of recentLogs) {
      feed.push({
        id: `activity-${log.id}`,
        type: "activity",
        icon: log.action,
        description: formatActivityDescription(log.action as ActivityActionType, log.userName, log.details as Record<string, unknown> | null),
        createdAt: log.createdAt,
      });
    }

    // Recent members
    for (const member of recentMembers) {
      feed.push({
        id: `member-${member.id}`,
        type: "member",
        icon: "MEMBER_SYNCED",
        description: `New member: ${member.fullname}`,
        createdAt: member.createdAt ?? new Date(),
      });
    }

    // Recent orders
    for (const order of recentOrders) {
      const label = order.orderNumber ? `#${order.orderNumber}` : order.customerName;
      feed.push({
        id: `order-${order.id}`,
        type: "order",
        icon: "ORDER_SYNCED",
        description: `Shirt order ${label} from ${order.customerName}`,
        createdAt: order.createdOn,
      });
    }

    // Sort by date descending, take top N
    feed.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return feed.slice(0, limit);
  } catch (error) {
    console.error("Error fetching dashboard feed:", error);
    return [];
  }
}

function formatActivityDescription(action: ActivityActionType, userName: string | null, details: Record<string, unknown> | null): string {
  const actor = userName ?? "System";
  switch (action) {
    case "USER_CREATED": return `${actor} created user${details?.newUserName ? ` ${details.newUserName}` : ""}`;
    case "USER_UPDATED": return `${actor} updated a user`;
    case "USER_DELETED": return `${actor} deleted user${details?.deletedUserName ? ` ${details.deletedUserName}` : ""}`;
    case "USER_ROLE_CHANGED": return `${actor} changed role${details?.newRole ? ` to ${details.newRole}` : ""}`;
    case "SETTINGS_UPDATED": return `${actor} updated settings`;
    case "ORDER_SYNCED": return `Orders synced${details?.added ? ` (${details.added} new)` : ""}`;
    case "ORDER_STATUS_UPDATED": return `${actor} updated order${details?.newStatus ? ` to ${details.newStatus}` : ""}`;
    case "ORDER_PACKED": return `${actor} packed an order`;
    case "ORDER_FULFILLED": return `${actor} fulfilled an order`;
    case "RECEIPT_SUBMITTED": return `${actor} submitted a receipt`;
    case "RECEIPT_APPROVED": return `${actor} approved a receipt`;
    case "RECEIPT_REJECTED": return `${actor} rejected a receipt`;
    case "RECEIPT_FULFILLED": return `${actor} fulfilled a receipt`;
    case "MEMBER_SYNCED": return details?.memberName ? `New member: ${details.memberName}` : "Members synced";
    case "LOGIN": return `${actor} logged in`;
    case "LOGOUT": return `${actor} logged out`;
    default: return `${actor} performed an action`;
  }
}

// Get activity for multiple orders with user images
export async function getOrdersActivityWithUsers(
  orderIds: string[],
): Promise<Record<string, ActivityLogEntry[]>> {
  try {
    const session = await auth();
    const userRole = await getSessionRole(session?.user);

    if (!session?.user || (userRole !== "Admin" && userRole !== "Treasurer")) {
      return {};
    }

    if (orderIds.length === 0) return {};

    // Get all activity logs for these orders
    const logs = await db
      .select()
      .from(activityLog)
      .where(and(eq(activityLog.entityType, "order"), inArray(activityLog.entityId, orderIds)))
      .orderBy(desc(activityLog.createdAt));

    // Get unique user IDs
    const userIds = [...new Set(logs.map((l) => l.userId).filter(Boolean))] as string[];

    // Fetch user images
    const userImages: Record<string, string | null> = {};
    if (userIds.length > 0) {
      const usersData = await db
        .select({ id: users.id, image: users.image })
        .from(users)
        .where(inArray(users.id, userIds));

      usersData.forEach((u) => {
        userImages[u.id] = u.image;
      });
    }

    // Group logs by order ID and add user images
    const result: Record<string, ActivityLogEntry[]> = {};

    for (const log of logs) {
      const orderId = log.entityId!;
      if (!result[orderId]) {
        result[orderId] = [];
      }
      result[orderId].push({
        ...log,
        userImage: log.userId ? userImages[log.userId] : null,
      } as ActivityLogEntry);
    }

    return result;
  } catch (error) {
    console.error("Error fetching orders activity:", error);
    return {};
  }
}
