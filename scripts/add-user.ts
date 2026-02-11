import "dotenv/config";
import { db } from "@/app/db";
import { users } from "@/app/db/schema";
import { saltAndHashPassword } from "@/app/utils/password";

async function addUser() {
  const username = "Alasdair";
  const password = "aues2025";
  const role = "Admin";

  console.log("Hashing password...");
  const hashedPassword = await saltAndHashPassword(password);

  console.log("Creating user...");
  const [newUser] = await db
    .insert(users)
    .values({
      name: username,
      password: hashedPassword,
      role: role as "General" | "Admin" | "Temporary",
      isActive: true,
    })
    .returning();

  console.log("✅ User created successfully!");
  console.log("Username:", newUser.name);
  console.log("Role:", newUser.role);
  console.log("ID:", newUser.id);

  process.exit(0);
}

addUser().catch((error) => {
  console.error("❌ Error creating user:", error);
  process.exit(1);
});
