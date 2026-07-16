import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const employees = await prisma.user.findMany({
      where: { role: { in: ["staff", "cashier"] } },
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
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: employees });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to fetch employees" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const {
      name, email, phone, password, role,
      birthDate, gender, address, dateHired, profilePicture,
    } = await request.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { success: false, message: "Name, email, password, and role are required" },
        { status: 400 }
      );
    }

    if (!["staff", "cashier"].includes(role)) {
      return NextResponse.json(
        { success: false, message: "Role must be staff or cashier" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Auto-generate employee number: first letter of first name + first letter of last name + year + month + count
    const nameParts = name.trim().split(/\s+/);
    const firstInitial = (nameParts[0] || "X")[0].toUpperCase();
    const lastInitial = (nameParts.length > 1 ? nameParts[nameParts.length - 1] : "X")[0].toUpperCase();
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const employeeCount = await prisma.user.count({
      where: { role: { in: ["staff", "cashier"] } },
    });
    const sequence = String(employeeCount + 1).padStart(3, "0");
    const employeeNumber = `${firstInitial}${lastInitial}${year}${month}${sequence}`;

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        password: hashedPassword,
        role,
        employeeNumber,
        birthDate: birthDate && birthDate.length > 0 ? new Date(birthDate) : null,
        gender: gender || null,
        address: address || null,
        dateHired: dateHired && dateHired.length > 0 ? new Date(dateHired) : new Date(),
        profilePicture: profilePicture && profilePicture.length > 0 ? profilePicture : null,
      },
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

    return NextResponse.json(
      { success: true, message: "Employee created successfully", data: user },
      { status: 201 }
    );
  } catch (error) {
    console.error("Employee create error:", error);
    const message = error instanceof Error ? error.message : "Failed to create employee";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
