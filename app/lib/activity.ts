import { db } from '@/app/db';
import { activityLog, ActivityActionType } from '@/app/db/schema';

interface LogActivityParams {
  userId?: string | null;
  userName?: string | null;
  action: ActivityActionType;
  entityType?: string;
  entityId?: string;
  details?: Record<string, unknown>;
}

export async function logActivity({
  userId,
  userName,
  action,
  entityType,
  entityId,
  details,
}: LogActivityParams): Promise<void> {
  try {
    await db.insert(activityLog).values({
      userId: userId || null,
      userName: userName || null,
      action,
      entityType: entityType || null,
      entityId: entityId || null,
      details: details || null,
      createdAt: new Date(),
    });
  } catch (error) {
    // Don't throw - activity logging should not break the main operation
    console.error('Failed to log activity:', error);
  }
}

// Convenience functions for common actions
export const ActivityLogger = {
  userCreated: (performedBy: { id: string; name: string }, newUser: { id: string; name: string; role: string }) =>
    logActivity({
      userId: performedBy.id,
      userName: performedBy.name,
      action: 'USER_CREATED',
      entityType: 'user',
      entityId: newUser.id,
      details: { newUserName: newUser.name, role: newUser.role },
    }),

  userUpdated: (performedBy: { id: string; name: string }, targetUser: { id: string; name: string }, changes: Record<string, unknown>) =>
    logActivity({
      userId: performedBy.id,
      userName: performedBy.name,
      action: 'USER_UPDATED',
      entityType: 'user',
      entityId: targetUser.id,
      details: { targetUserName: targetUser.name, changes },
    }),

  userDeleted: (performedBy: { id: string; name: string }, deletedUser: { id: string; name: string }) =>
    logActivity({
      userId: performedBy.id,
      userName: performedBy.name,
      action: 'USER_DELETED',
      entityType: 'user',
      entityId: deletedUser.id,
      details: { deletedUserName: deletedUser.name },
    }),

  userRoleChanged: (performedBy: { id: string; name: string }, targetUser: { id: string; name: string }, oldRole: string, newRole: string) =>
    logActivity({
      userId: performedBy.id,
      userName: performedBy.name,
      action: 'USER_ROLE_CHANGED',
      entityType: 'user',
      entityId: targetUser.id,
      details: { targetUserName: targetUser.name, oldRole, newRole },
    }),

  settingsUpdated: (performedBy: { id: string; name: string }, changedFields: string[]) =>
    logActivity({
      userId: performedBy.id,
      userName: performedBy.name,
      action: 'SETTINGS_UPDATED',
      entityType: 'settings',
      details: { changedFields },
    }),

  orderSynced: (performedBy: { id: string; name: string }, stats: { added: number; updated: number }) =>
    logActivity({
      userId: performedBy.id,
      userName: performedBy.name,
      action: 'ORDER_SYNCED',
      entityType: 'order',
      details: stats,
    }),

  orderStatusUpdated: (performedBy: { id: string; name: string }, orderId: string, oldStatus: string, newStatus: string, customerName?: string) =>
    logActivity({
      userId: performedBy.id,
      userName: performedBy.name,
      action: newStatus === 'PACKED' ? 'ORDER_PACKED' : newStatus === 'FULFILLED' ? 'ORDER_FULFILLED' : 'ORDER_STATUS_UPDATED',
      entityType: 'order',
      entityId: orderId,
      details: { oldStatus, newStatus, customerName },
    }),

  receiptSubmitted: (performedBy: { id: string; name: string }, receiptId: string, amount: string) =>
    logActivity({
      userId: performedBy.id,
      userName: performedBy.name,
      action: 'RECEIPT_SUBMITTED',
      entityType: 'receipt',
      entityId: receiptId,
      details: { amount },
    }),

  receiptApproved: (performedBy: { id: string; name: string }, receiptId: string, submittedBy: string) =>
    logActivity({
      userId: performedBy.id,
      userName: performedBy.name,
      action: 'RECEIPT_APPROVED',
      entityType: 'receipt',
      entityId: receiptId,
      details: { submittedBy },
    }),

  receiptRejected: (performedBy: { id: string; name: string }, receiptId: string, submittedBy: string, reason?: string) =>
    logActivity({
      userId: performedBy.id,
      userName: performedBy.name,
      action: 'RECEIPT_REJECTED',
      entityType: 'receipt',
      entityId: receiptId,
      details: { submittedBy, reason },
    }),

  receiptFulfilled: (performedBy: { id: string; name: string }, receiptId: string, submittedBy: string) =>
    logActivity({
      userId: performedBy.id,
      userName: performedBy.name,
      action: 'RECEIPT_FULFILLED',
      entityType: 'receipt',
      entityId: receiptId,
      details: { submittedBy },
    }),

  membersSynced: (performedBy: { id: string; name: string }, stats: { added: number }) =>
    logActivity({
      userId: performedBy.id,
      userName: performedBy.name,
      action: 'MEMBER_SYNCED',
      entityType: 'member',
      details: stats,
    }),

  login: (user: { id: string; name: string }) =>
    logActivity({
      userId: user.id,
      userName: user.name,
      action: 'LOGIN',
      entityType: 'session',
    }),

  logout: (user: { id: string; name: string }) =>
    logActivity({
      userId: user.id,
      userName: user.name,
      action: 'LOGOUT',
      entityType: 'session',
    }),
};
