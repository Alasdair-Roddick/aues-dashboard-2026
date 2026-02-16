import "dotenv/config";
import { db } from "@/app/db";
import { users } from "@/app/db/schema";
import { saltAndHashPassword } from "@/app/utils/password";
import { eq } from "drizzle-orm";

/**
 * Rehash all user passwords after migrating from argon2 to bcryptjs.
 * Since we can't reverse argon2 hashes, this resets all passwords to: ${username}2026
 * Users should change their passwords after this migration.
 */
async function rehashPasswords() {
  const allUsers = await db.select().from(users);

  console.log(`Found ${allUsers.length} users to rehash...`);

  for (const user of allUsers) {
    const defaultPassword = `${user.name}2026`;
    const newHash = await saltAndHashPassword(defaultPassword);

    await db.update(users).set({ password: newHash }).where(eq(users.id, user.id));

    console.log(`Rehashed password for: ${user.name}`);
  }

  console.log("Done! All passwords reset to {username}2026");
  process.exit(0);
}

rehashPasswords().catch((error) => {
  console.error("Error rehashing passwords:", error);
  process.exit(1);
});
