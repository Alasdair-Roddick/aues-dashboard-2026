"use server";

import { db } from "@/app/db";
import { users } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";

export async function updateUserProfile(data: {
  name?: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string;
  image?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  await db
    .update(users)
    .set({
      name: data.name,
      lastName: data.lastName,
      phoneNumber: data.phoneNumber,
      email: data.email,
      updatedAt: new Date(),
    })
    .where(eq(users.id, session.user.id));
}
