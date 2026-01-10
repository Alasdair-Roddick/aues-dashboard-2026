import "dotenv/config";
import { db } from "@/app/db";
import { users } from "@/app/db/schema";
import { saltAndHashPassword } from "@/app/utils/password";

export async function addUser(username: string, password: string, role: 'General' | 'Admin' | 'Temporary' | 'Treasurer') {
    console.log("Hashing password...");
    const hashedPassword = await saltAndHashPassword(password);

    console.log("Creating user...");
    const [newUser] = await db
        .insert(users)
        .values({
            name: username,
            password: hashedPassword,
            role: role,
            isActive: true,
        })
        .returning();

    console.log("✅ User created successfully!");
    console.log("Username:", newUser.name);
    console.log("Role:", newUser.role);
    console.log("ID:", newUser.id);

    return newUser;
}