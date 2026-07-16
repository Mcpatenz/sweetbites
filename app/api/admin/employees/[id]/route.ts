import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      name, email, phone, password, role,
      birthDate, gender, address, dateHired, profilePicture,
    } = body;

    if (role && !["staff", "cashier"].includes(role)) {
      return NextResponse.json(
        { success: false, message: "Role must be staff or cashier" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Employee not found" },
        { status: 404 }
      );
    }

    if (email && email !== existing.email) {
      const emailTaken = await prisma.user.findUnique({ where: { email } });
      if (emailTaken) {
        return NextResponse.json(
          { success: false, message: "Email is already in use" },
          { status: 409 }
        );
      }
    }

    const updateData: Record<string, unknown> = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone || null;
    if (role) updateData.role = role;
    if (password) updateData.password = await bcrypt.hash(password, 12);
    if (birthDate !== undefined) updateData.birthDate = birthDate && birthDate.length > 0 ? new Date(birthDate) : null;
    if (gender !== undefined) updateData.gender = gender || null;
    if (address !== undefined) updateData.address = address || null;
    if (dateHired !== undefined) updateData.dateHired = dateHired && dateHired.length > 0 ? new Date(dateHired) : null;
    if (profilePicture !== undefined) updateData.profilePicture = profilePicture && profilePicture.length > 0 ? profilePicture : null;

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        employeeNumber: true,
        birthDate: true,
        gender: true,
        address: true,
        dateHired: true,
        profilePicture: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Employee updated successfully",
      data: user,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to update employee" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Employee not found" },
        { status: 404 }
      );
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Employee deleted successfully",
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to delete employee" },
      { status: 500 }
    );
  }
}
