import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 },
      )
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json(
        { success: false, message: "No account found with this email address" },
        { status: 401 },
      )
    }

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Invalid password. Please try again." },
        { status: 401 },
      )
    }

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      profilePicture: user.profilePicture || null,
      address: user.address || null,
      employeeNumber: user.employeeNumber || null,
      birthDate: user.birthDate ? user.birthDate.toISOString() : null,
      gender: user.gender || null,
      dateHired: user.dateHired ? user.dateHired.toISOString() : null,
    }

    return NextResponse.json({
      success: true,
      message: "Login successful",
      data: userData,
    })
  } catch {
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 },
    )
  }
}
