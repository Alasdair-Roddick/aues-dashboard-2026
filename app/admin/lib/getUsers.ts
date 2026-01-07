import { db } from "@/app/db";
import { users } from "@/app/db/schema";

export async function getAllUsers() {
  const allUsers = await db.select().from(users);
  return allUsers;
}
