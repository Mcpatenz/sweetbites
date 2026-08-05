import { NextRequest, NextResponse } from "next/server";
import { get } from "@vercel/blob";

const PRIVATE_BLOB_HOST = ".private.blob.vercel-storage.com";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url || !url.includes(PRIVATE_BLOB_HOST)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return new NextResponse("Blob token is not set", { status: 500 });
  }

  try {
    const result = await get(url, { access: "private", token });
    if (!result || !result.stream) {
      return new NextResponse("Not found", { status: 404 });
    }

    const { stream, blob } = result;
    return new Response(stream as ReadableStream, {
      headers: {
        "Content-Type": blob.contentType ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error serving private blob:", error);
    return new NextResponse("Failed to fetch image", { status: 500 });
  }
}
