import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/app/db";
import { users } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
    const session = await auth();
    
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Validate file type
        const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
        if (!validTypes.includes(file.type)) {
            return NextResponse.json({ error: "Invalid file type. Use JPEG, PNG, WebP, or GIF." }, { status: 400 });
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            return NextResponse.json({ error: "File too large. Max 5MB." }, { status: 400 });
        }

        // Get current user's image to delete later
        const [currentUser] = await db
            .select({ image: users.image })
            .from(users)
            .where(eq(users.id, session.user.id))
            .limit(1);

        // Create uploads directory if it doesn't exist
        const uploadsDir = path.join(process.cwd(), "public", "uploads", "avatars");
        await mkdir(uploadsDir, { recursive: true });

        // Generate unique filename
        const ext = file.name.split(".").pop();
        const filename = `${session.user.id}-${Date.now()}.${ext}`;
        const filepath = path.join(uploadsDir, filename);

        // Write file
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filepath, buffer);

        // Store URL in database (use API route for serving)
        const imageUrl = `/api/uploads/avatars/${filename}`;
        await db
            .update(users)
            .set({ image: imageUrl, updatedAt: new Date() })
            .where(eq(users.id, session.user.id));

        // Delete old image if it exists and is in our uploads folder
        if (currentUser?.image && (currentUser.image.startsWith("/uploads/avatars/") || currentUser.image.startsWith("/api/uploads/avatars/"))) {
            const oldFilename = currentUser.image.split("/").pop();
            const oldFilePath = path.join(process.cwd(), "public", "uploads", "avatars", oldFilename!);
            try {
                await unlink(oldFilePath);
            } catch {
                // Ignore errors if file doesn't exist
            }
        }

        return NextResponse.json({ success: true, url: imageUrl });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}
