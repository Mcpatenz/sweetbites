import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendStatusUpdateToCustomer, sendStatusUpdateToAdmin } from "@/lib/email";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        customer: true,
        payment: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch order", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const order = await prisma.order.update({
      where: { id },
      data: {
        status: body.status,
        paymentStatus: body.paymentStatus,
      },
      include: {
        items: { include: { product: true } },
        customer: { include: { user: true } },
      },
    });

    // Send status update emails (non-blocking)
    if (body.status) {
      const emailData = {
        id: order.id,
        status: order.status as string,
        total: Number(order.total),
        items: order.items.map((item) => ({
          product: item.product ? { name: item.product.name } : undefined,
          quantity: item.quantity,
          price: Number(item.price),
        })),
        customer: {
          name: order.customer.name,
          email: order.customer.email || order.customer.user?.email || undefined,
          phone: order.customer.phone,
        },
      };
      sendStatusUpdateToCustomer(emailData).catch(() => {});
      sendStatusUpdateToAdmin(emailData).catch(() => {});
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to update order", error: error instanceof Error ? error.message : "Unknown error" },
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

    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: { payment: true },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    await prisma.orderItem.deleteMany({ where: { orderId: id } });
    await prisma.payment.deleteMany({ where: { orderId: id } });
    await prisma.order.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to delete order", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
