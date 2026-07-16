import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      todayOrders,
      pendingOrders,
      totalProducts,
      todayRevenue,
      allOrders,
      recentOrders,
      lowStockProducts,
    ] = await Promise.all([
      prisma.order.count({ where: { createdAt: { gte: startOfDay } } }),
      prisma.order.count({ where: { status: "Pending" } }),
      prisma.product.count({ where: { archived: false } }),
      prisma.order.aggregate({
        where: { createdAt: { gte: startOfDay }, status: { not: "Cancelled" } },
        _sum: { total: true },
      }),
      prisma.order.findMany({
        where: { createdAt: { gte: startOfDay }, status: { not: "Cancelled" } },
        select: { total: true, status: true, createdAt: true },
      }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { customer: { select: { name: true } } },
      }),
      prisma.product.findMany({
        where: { stock: { lte: 5 }, archived: false },
        select: { name: true, stock: true },
      }),
    ]);

    const statusCounts: Record<string, number> = {};
    for (const o of allOrders) {
      statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
    }

    const dailySales: { date: string; sales: number; orders: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);

      const dayOrders = await prisma.order.findMany({
        where: {
          createdAt: { gte: dayStart, lt: dayEnd },
          status: { not: "Cancelled" },
        },
        select: { total: true },
      });

      const dayName = d.toLocaleDateString("en-PH", { weekday: "short" });
      dailySales.push({
        date: dayName,
        sales: dayOrders.reduce((sum, o) => sum + Number(o.total), 0),
        orders: dayOrders.length,
      });
    }

    const bestSelling = await prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    });

    const productIds = bestSelling.map((b) => b.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true },
    });

    const bestSellingData = bestSelling.map((b) => ({
      name: products.find((p) => p.id === b.productId)?.name || "Unknown",
      sales: b._sum.quantity || 0,
    }));

    const recentActivity = recentOrders.map((o) => ({
      text: `New order from ${o.customer?.name || "Customer"}`,
      time: o.createdAt.toISOString(),
      orderId: o.id,
    }));

    return NextResponse.json({
      success: true,
      data: {
        todaySales: Number(todayRevenue._sum.total || 0),
        todayOrders,
        totalProducts,
        pendingOrders,
        statusCounts,
        dailySales,
        bestSellingData,
        recentActivity,
        lowStockProducts,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch dashboard stats", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
