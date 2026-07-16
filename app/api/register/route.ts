import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const { name, email, phone, password } = await request.json()

    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 },
      )
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { success: false, message: "An account with this email already exists" },
        { status: 409 },
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: { name, email, phone, password: hashedPassword, role: "customer" },
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
    })

    return NextResponse.json(
      { success: true, message: "Account created successfully", data: user },
      { status: 201 },
    )
  } catch {
    return NextResponse.json(
      { success: false, message: "Registration failed. Please try again." },
      { status: 500 },
    )
  }
}
