import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    let settings = await prisma.businessSetting.findUnique({ where: { id: 1 } });
    if (!settings) {
      settings = await prisma.businessSetting.create({
        data: { id: 1, businessName: "Sweet Bites Bakery" },
      });
    }
    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch settings", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const settings = await prisma.businessSetting.upsert({
      where: { id: 1 },
      update: {
        businessName: body.businessName,
        contactNumber: body.contactNumber,
        address: body.address,
        facebook: body.facebook,
        instagram: body.instagram,
        gcashQR: body.gcashQR,
        mayaQR: body.mayaQR,
      },
      create: {
        id: 1,
        businessName: body.businessName || "Sweet Bites Bakery",
        contactNumber: body.contactNumber,
        address: body.address,
        facebook: body.facebook,
        instagram: body.instagram,
        gcashQR: body.gcashQR,
        mayaQR: body.mayaQR,
      },
    });

    return NextResponse.json({ success: true, data: settings, message: "Settings saved successfully" });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to save settings", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
