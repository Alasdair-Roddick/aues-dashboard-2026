"use server";

import { db } from "@/app/db";
import { activityLog, users, ActivityActionType } from "@/app/db/schema";
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
    const userRole = getSessionRole(session?.user);

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
    const userRole = getSessionRole(session?.user);

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
    const userRole = getSessionRole(session?.user);

    // Only Admin can view recent activity
    if (!session?.user || userRole !== "Admin") {
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

// Get activity for multiple orders with user images
export async function getOrdersActivityWithUsers(
  orderIds: string[],
): Promise<Record<string, ActivityLogEntry[]>> {
  try {
    const session = await auth();
    const userRole = getSessionRole(session?.user);

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
