import { members } from "@/app/db/schema";
import { db } from "@/app/db/index";
import { desc, eq } from "drizzle-orm";

export async function getAllMembers() {
  return await db.select().from(members).orderBy(desc(members.createdAt));
}

export async function getMemberById(id: number) {
  const rows = await db.select().from(members).where(eq(members.id, id)).limit(1);
  return rows[0] || null;
}
