"use server";

import { db } from "@/app/db";
import { receiptReimbursements, users } from "@/app/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

type UserRole = "Admin" | "General" | "Temporary" | "Treasurer";

function getSessionRole(user: unknown): UserRole | null {
  const role = (user as { role?: UserRole } | undefined)?.role;
  return role ?? null;
}

export async function createReceiptReimbursement(data: {
  amount: string;
  description?: string;
  receiptImageUrl: string;
  requiresPriorApproval: boolean;
  approvedByUserId?: string;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await db.insert(receiptReimbursements).values({
      userId: session.user.id,
      amount: data.amount,
      description: data.description,
      receiptImageUrl: data.receiptImageUrl,
      requiresPriorApproval: data.requiresPriorApproval,
      approvedByUserId: data.approvedByUserId || null,
      status: "Pending",
    });

    revalidatePath("/receipts");
    return { success: true };
  } catch (error) {
    console.error("Error creating receipt reimbursement:", error);
    return { success: false, error: "Failed to create reimbursement request" };
  }
}

export async function getUserReceipts() {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const receipts = await db
      .select({
        id: receiptReimbursements.id,
        amount: receiptReimbursements.amount,
        description: receiptReimbursements.description,
        receiptImageUrl: receiptReimbursements.receiptImageUrl,
        requiresPriorApproval: receiptReimbursements.requiresPriorApproval,
        approvedByUserId: receiptReimbursements.approvedByUserId,
        status: receiptReimbursements.status,
        treasurerNotes: receiptReimbursements.treasurerNotes,
        processedAt: receiptReimbursements.processedAt,
        createdAt: receiptReimbursements.createdAt,
        approvedByName: users.name,
      })
      .from(receiptReimbursements)
      .leftJoin(users, eq(receiptReimbursements.approvedByUserId, users.id))
      .where(eq(receiptReimbursements.userId, session.user.id))
      .orderBy(desc(receiptReimbursements.createdAt));

    return { success: true, data: receipts };
  } catch (error) {
    console.error("Error fetching user receipts:", error);
    return { success: false, error: "Failed to fetch receipts" };
  }
}

export async function getAllReceipts() {
  const session = await auth();

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  const userRole = getSessionRole(session.user);
  if (userRole !== "Treasurer" && userRole !== "Admin") {
    return { success: false, error: "Unauthorized - Treasurer or Admin role required" };
  }

  try {
    const receipts = await db
      .select({
        id: receiptReimbursements.id,
        userId: receiptReimbursements.userId,
        userName: users.name,
        userBankName: users.bankName,
        userBSB: users.BSB,
        userAccountNumber: users.accountNumber,
        userAccountName: users.accountName,
        amount: receiptReimbursements.amount,
        description: receiptReimbursements.description,
        receiptImageUrl: receiptReimbursements.receiptImageUrl,
        requiresPriorApproval: receiptReimbursements.requiresPriorApproval,
        approvedByUserId: receiptReimbursements.approvedByUserId,
        status: receiptReimbursements.status,
        treasurerNotes: receiptReimbursements.treasurerNotes,
        processedByUserId: receiptReimbursements.processedByUserId,
        processedAt: receiptReimbursements.processedAt,
        createdAt: receiptReimbursements.createdAt,
        updatedAt: receiptReimbursements.updatedAt,
      })
      .from(receiptReimbursements)
      .innerJoin(users, eq(receiptReimbursements.userId, users.id))
      .orderBy(desc(receiptReimbursements.createdAt));

    return { success: true, data: receipts };
  } catch (error) {
    console.error("Error fetching all receipts:", error);
    return { success: false, error: "Failed to fetch receipts" };
  }
}

export async function updateReceiptStatus(
  receiptId: string,
  status: "Pending" | "Fulfilled" | "Rejected",
  treasurerNotes?: string,
) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const userRole = getSessionRole(session.user);
  if (userRole !== "Treasurer" && userRole !== "Admin") {
    return { success: false, error: "Unauthorized - Treasurer or Admin role required" };
  }

  try {
    await db
      .update(receiptReimbursements)
      .set({
        status,
        treasurerNotes,
        processedByUserId: session.user.id,
        processedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(receiptReimbursements.id, receiptId));

    revalidatePath("/treasurer/receipts");
    return { success: true };
  } catch (error) {
    console.error("Error updating receipt status:", error);
    return { success: false, error: "Failed to update receipt status" };
  }
}

export async function getAdminUsers() {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const admins = await db
      .select({
        id: users.id,
        name: users.name,
      })
      .from(users)
      .where(eq(users.role, "Admin"));

    return { success: true, data: admins };
  } catch (error) {
    console.error("Error fetching admin users:", error);
    return { success: false, error: "Failed to fetch admins" };
  }
}
