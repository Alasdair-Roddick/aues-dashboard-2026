import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { writeFile, mkdir } from "fs/promises";
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
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Use JPEG, PNG, WebP, GIF, or PDF." },
        { status: 400 },
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large. Max 10MB." }, { status: 400 });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "receipts");
    await mkdir(uploadsDir, { recursive: true });

    // Generate unique filename
    const ext = file.name.split(".").pop();
    const filename = `${session.user.id}-${Date.now()}.${ext}`;
    const filepath = path.join(uploadsDir, filename);

    // Write file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Return URL
    const imageUrl = `/api/uploads/receipts/${filename}`;
    return NextResponse.json({ success: true, url: imageUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
