import { NextResponse } from "next/server";

function getResetCodes(): Map<string, { code: string; expiresAt: number }> {
  if (!(globalThis as any).__resetCodes) {
    (globalThis as any).__resetCodes = new Map();
  }
  return (globalThis as any).__resetCodes;
}

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    // Check if user exists (import prisma dynamically to avoid issues)
    const { prisma } = await import("@/lib/prisma");
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "No account found with this email" },
        { status: 404 }
      );
    }

    const code = generateCode();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    const store = getResetCodes();
    store.set(email, { code, expiresAt });

    return NextResponse.json({
      success: true,
      message: "Reset code sent to your email",
      code, // Demo mode — returned to frontend
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to process request" },
      { status: 500 }
    );
  }
}
