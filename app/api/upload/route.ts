import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { randomUUID } from "crypto";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file uploaded" },
        { status: 400 },
      );
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: "Invalid file type. Allowed: JPG, PNG, WebP, GIF" },
        { status: 400 },
      );
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, message: "File too large. Max size: 5MB" },
        { status: 400 },
      );
    }

    const ext = file.name.split(".").pop() || "png";
    const filename = `${randomUUID()}.${ext}`;

    const blob = await put(filename, file, {
      access: "public",
      contentType: file.type,
    });

    return NextResponse.json({
      success: true,
      message: "File uploaded successfully",
      data: { url: blob.url },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to upload file",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
