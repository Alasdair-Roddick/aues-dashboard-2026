"use server";

import { fullSync, invalidateRubricSettingsCache } from "@/app/lib/rubric";
import { db } from "@/app/db";
import { members, ausaExports } from "@/app/db/schema";
import { desc } from "drizzle-orm";
import { auth } from "@/auth";
import { ActivityLogger } from "@/app/lib/activity";

export async function syncMembers() {
  try {
    invalidateRubricSettingsCache();
    await fullSync();
    return { success: true };
  } catch (error) {
    console.error("Error syncing members:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

function escapeCsvField(value: string | null): string {
  if (!value) return "";
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function exportMembersToCSV() {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string })?.role;

    if (!session?.user || role === "Temporary" || !role) {
      return { success: false as const, error: "Unauthorized" };
    }

    const allMembers = await db.select().from(members);

    const header =
      "Full Name,Student ID,Do you agree to abide by the Clubs Code of Conduct?,Do you consent to the transfer of your membership to the AUSA page?";
    const rows = allMembers.map(
      (m) => `${escapeCsvField(m.fullname)},${escapeCsvField(m.membershipId)},TRUE,TRUE`,
    );
    const csv = [header, ...rows].join("\n");

    await db.insert(ausaExports).values({
      memberCount: allMembers.length,
      exportedByUserId: session.user.id as string,
      exportedByUserName: session.user.name as string,
    });

    await ActivityLogger.membersExported(
      { id: session.user.id as string, name: session.user.name as string },
      { memberCount: allMembers.length },
    );

    return { success: true as const, csv, memberCount: allMembers.length };
  } catch (error) {
    console.error("Error exporting members:", error);
    return { success: false as const, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function getAusaExportHistory() {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string })?.role;

    if (!session?.user || role === "Temporary" || !role) {
      return [];
    }

    const history = await db
      .select()
      .from(ausaExports)
      .orderBy(desc(ausaExports.exportedAt))
      .limit(5);

    return history.map((e) => ({
      id: e.id,
      exportedAt: e.exportedAt,
      memberCount: e.memberCount,
      exportedByUserName: e.exportedByUserName,
    }));
  } catch (error) {
    console.error("Error fetching export history:", error);
    return [];
  }
}
