/**
 * @file app/api/cron/sync-orders/route.ts
 * @description Sits here and waits for an external app to ping it, then it will trigger the sync orders function
 */

import { syncShirtOrdersToDatabase } from "@/app/lib/squarespace";
import { db } from "@/app/db";
import { siteSettings } from "@/app/db/schema";
import { NextResponse } from "next/server";

const SYNC_INTERVAL = 1000 * 60 * 5; // 5 minutes

export async function POST(request: Request) {
  const auth = request.headers.get("Authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check last sync time from database (distributed-safe)
  const settings = await db.select().from(siteSettings).limit(1);
  const lastSync = settings[0]?.lastOrderSyncAt?.getTime() ?? 0;

  if (Date.now() - lastSync < SYNC_INTERVAL) {
    return NextResponse.json(
      { error: "Sync already in progress or recently completed" },
      { status: 429 },
    );
  }

  // Update sync timestamp before running (prevents concurrent starts)
  if (settings.length > 0) {
    await db.update(siteSettings).set({ lastOrderSyncAt: new Date() });
  }

  try {
    await syncShirtOrdersToDatabase();
    return NextResponse.json({ message: "Orders synced successfully" });
  } catch (error) {
    console.error("Error syncing orders:", error);
    return NextResponse.json({ error: "Failed to sync orders" }, { status: 500 });
  }
}
