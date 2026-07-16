import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, phone, address, gender, profilePicture, currentPassword, newPassword } = body;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    if (currentPassword && newPassword) {
      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        return NextResponse.json({ success: false, message: "Current password is incorrect" }, { status: 400 });
      }
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
        ...(address !== undefined && { address }),
        ...(gender !== undefined && { gender }),
        ...(profilePicture !== undefined && { profilePicture }),
        ...(newPassword && { password: await bcrypt.hash(newPassword, 10) }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        profilePicture: true,
        address: true,
        employeeNumber: true,
        birthDate: true,
        gender: true,
        dateHired: true,
      },
    });

    return NextResponse.json({ success: true, message: "Profile updated", data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to update profile", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
