import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

function getResetCodes(): Map<string, { code: string; expiresAt: number }> {
  if (!(globalThis as any).__resetCodes) {
    (globalThis as any).__resetCodes = new Map();
  }
  return (globalThis as any).__resetCodes;
}

export async function POST(request: Request) {
  try {
    const { email, code, newPassword } = await request.json();

    if (!email || !code || !newPassword) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const store = getResetCodes();
    const stored = store.get(email);

    if (!stored) {
      return NextResponse.json(
        { success: false, message: "No reset code found. Please request a new one." },
        { status: 400 }
      );
    }

    if (Date.now() > stored.expiresAt) {
      store.delete(email);
      return NextResponse.json(
        { success: false, message: "Reset code has expired. Please request a new one." },
        { status: 400 }
      );
    }

    if (stored.code !== code) {
      return NextResponse.json(
        { success: false, message: "Invalid reset code" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    store.delete(email);

    return NextResponse.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to reset password" },
      { status: 500 }
    );
  }
}
