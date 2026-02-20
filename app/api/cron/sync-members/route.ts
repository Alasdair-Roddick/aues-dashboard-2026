/**
 * @file app/api/cron/sync-members/route.ts
 * @description Waits for an external app to ping it, runs a full member sync,
 * and returns an adaptive interval for the next check based on how many
 * new members were found.
 */

import { fullSync } from "@/app/lib/rubric";
import { logActivity } from "@/app/lib/activity";
import { db } from "@/app/db";
import { siteSettings } from "@/app/db/schema";
import { NextResponse } from "next/server";

const MIN_SYNC_INTERVAL = 1000 * 60 * 1; // 1 minute

// Adaptive intervals (in seconds) returned to the external caller
const INTERVAL_HIGH = 60 * 1; // 1 min — lots of new members, check again soon
const INTERVAL_MEDIUM = 60 * 5; // 5 min — a few new members
const INTERVAL_LOW = 60 * 30; // 30 min — no new members, check less often

function getNextCheckInterval(newMembers: number): number {
  if (newMembers >= 10) return INTERVAL_HIGH;
  if (newMembers >= 1) return INTERVAL_MEDIUM;
  return INTERVAL_LOW;
}

export async function POST(request: Request) {
  const auth = request.headers.get("Authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check last sync time from database (distributed-safe)
  const settings = await db.select().from(siteSettings).limit(1);
  const lastSync = settings[0]?.lastMemberSyncAt?.getTime() ?? 0;

  if (Date.now() - lastSync < MIN_SYNC_INTERVAL) {
    return NextResponse.json(
      { error: "Sync already in progress or recently completed" },
      { status: 429 },
    );
  }

  // Update sync timestamp before running (prevents concurrent starts)
  if (settings.length > 0) {
    await db.update(siteSettings).set({ lastMemberSyncAt: new Date() });
  }

  try {
    const { newMembers, newMemberNames, durationSeconds } = await fullSync();
    const nextCheckInSeconds = getNextCheckInterval(newMembers);

    // Log each new member as activity
    for (const name of newMemberNames) {
      await logActivity({
        userName: "System",
        action: "MEMBER_SYNCED",
        entityType: "member",
        details: { memberName: name },
      });
    }

    return NextResponse.json({
      message: "Members synced successfully",
      newMembers,
      durationSeconds,
      nextCheckInSeconds,
    });
  } catch (error) {
    console.error("Error syncing members:", error);
    return NextResponse.json({ error: "Failed to sync members" }, { status: 500 });
  }
}
