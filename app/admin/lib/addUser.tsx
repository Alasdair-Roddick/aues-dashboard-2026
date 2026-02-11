import { db } from "@/app/db";
import { users } from "@/app/db/schema";
import { saltAndHashPassword } from "@/app/utils/password";

export async function addUser(
  username: string,
  password: string,
  role: "General" | "Admin" | "Temporary" | "Treasurer",
) {
  const hashedPassword = await saltAndHashPassword(password);

  const [newUser] = await db
    .insert(users)
    .values({
      name: username,
      password: hashedPassword,
      role: role,
      isActive: true,
    })
    .returning();

  return newUser;
}
