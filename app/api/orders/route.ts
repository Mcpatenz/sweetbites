import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/lib/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const status = searchParams.get("status");

    const where: any = {};
    if (userId) {
      const customer = await prisma.customer.findFirst({ where: { userId } });
      if (customer) {
        where.customerId = customer.id;
      } else {
        return NextResponse.json<ApiResponse<any>>({
          success: true,
          message: "Orders fetched successfully",
          data: [],
        });
      }
    }
    if (status && status !== "All") {
      where.status = status;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: { product: true },
        },
        customer: {
          include: { user: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json<ApiResponse<any>>({
      success: true,
      message: "Orders fetched successfully",
      data: orders,
    });
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        message: "Failed to fetch orders",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, subtotal, deliveryFee, total, paymentMethod, deliveryType, deliveryDate, deliveryTime, notes, userId, customerInfo, receiptUrl } = body;
    const customerLat = customerInfo?.latitude != null ? Number(customerInfo.latitude) : null;
    const customerLng = customerInfo?.longitude != null ? Number(customerInfo.longitude) : null;

    if (!items || items.length === 0) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, message: "No items in order", error: "Cart is empty" },
        { status: 400 },
      );
    }

    // Resolve customer: use logged-in user's info if available, otherwise fall back to guest
    let customer;
    if (userId) {
      // Find or create a Customer record linked to this User
      customer = await prisma.customer.findFirst({
        where: { userId },
      });
      if (!customer) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        customer = await prisma.customer.create({
          data: {
            name: user?.name || customerInfo?.name || "Customer",
            email: user?.email || null,
            phone: user?.phone || customerInfo?.phone || "0000000000",
            address: customerInfo?.address || user?.address || "No address provided",
            landmark: customerInfo?.landmark || null,
            latitude: customerLat,
            longitude: customerLng,
            userId,
          },
        });
      } else {
        // Update customer info from the latest form data
        await prisma.customer.update({
          where: { id: customer.id },
          data: {
            name: customerInfo?.name || customer.name,
            phone: customerInfo?.phone || customer.phone,
            address: customerInfo?.address || customer.address,
            landmark: customerInfo?.landmark ?? customer.landmark,
            latitude: customerLat ?? customer.latitude,
            longitude: customerLng ?? customer.longitude,
          },
        });
      }
    } else {
      // Guest fallback
      customer = await prisma.customer.findFirst({
        where: { name: "Guest Customer" },
      });
      if (!customer) {
        customer = await prisma.customer.create({
          data: {
            name: "Guest Customer",
            phone: "0000000000",
            address: "Walk-in",
          },
        });
      }
    }

    const paymentMethodMap: Record<string, string> = {
      "Cash on Delivery": "Cash_on_Delivery",
      "GCash": "GCash",
      "Maya": "Maya",
    };

    const prismaPaymentMethod = paymentMethodMap[paymentMethod] || "Cash_on_Delivery";

    let parsedDeliveryDate: Date | null = null;
    if (deliveryDate && typeof deliveryDate === "string" && deliveryDate.trim() !== "") {
      const d = new Date(deliveryDate + "T00:00:00");
      if (!isNaN(d.getTime())) {
        parsedDeliveryDate = d;
      }
    }

    // Create order with items
    const order = await prisma.order.create({
      data: {
        customerId: customer.id,
        subtotal: subtotal,
        deliveryFee: deliveryFee ?? 50,
        total: total,
        paymentMethod: prismaPaymentMethod as any,
        deliveryType: (deliveryType || "Delivery") as any,
        deliveryDate: parsedDeliveryDate,
        deliveryTime: deliveryTime && deliveryTime.trim() !== "" ? deliveryTime : null,
        notes: notes || null,
        status: "Pending" as any,
        paymentStatus: "Pending" as any,
        items: {
          create: items.map((item: { productId: string; quantity: number; price: number }) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: true,
        customer: true,
      },
    });

    if (receiptUrl && prismaPaymentMethod !== "Cash_on_Delivery") {
      await prisma.payment.create({
        data: {
          orderId: order.id,
          method: prismaPaymentMethod as any,
          receipt: receiptUrl,
          amount: total,
          status: "Pending" as any,
        },
      });
    }

    return NextResponse.json<ApiResponse<any>>(
      {
        success: true,
        message: "Order created successfully",
        data: order,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        message: "Failed to create order",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
