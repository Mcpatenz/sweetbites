import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "daily";
    const dateStr = searchParams.get("date") || new Date().toISOString().split("T")[0];

    const now = new Date(dateStr + "T00:00:00");

    let rangeStart: Date;
    let rangeEnd: Date;
    let periodLabel: string;

    if (filter === "daily") {
      rangeStart = new Date(now);
      rangeEnd = new Date(now);
      rangeEnd.setDate(rangeEnd.getDate() + 1);
      periodLabel = now.toLocaleDateString("en-PH", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    } else if (filter === "monthly") {
      rangeStart = new Date(now.getFullYear(), now.getMonth(), 1);
      rangeEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      periodLabel = now.toLocaleDateString("en-PH", { year: "numeric", month: "long" });
    } else {
      rangeStart = new Date(now.getFullYear(), 0, 1);
      rangeEnd = new Date(now.getFullYear() + 1, 0, 1);
      periodLabel = String(now.getFullYear());
    }

    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: rangeStart, lt: rangeEnd },
        status: { not: "Cancelled" },
      },
      include: {
        items: { include: { product: true } },
        customer: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Status counts
    const pendingOrders = orders.filter((o) => o.status === "Pending");
    const confirmedOrders = orders.filter((o) => o.status === "Confirmed");
    const preparingOrders = orders.filter((o) => o.status === "Preparing");
    const sentToCashier = orders.filter((o) => o.status === "Out_for_Delivery");
    const deliveredOrders = orders.filter((o) => o.status === "Delivered");

    // Financial summary
    const totalRevenue = deliveredOrders.reduce((sum, o) => sum + Number(o.total), 0);
    const pendingRevenue = [...pendingOrders, ...confirmedOrders, ...preparingOrders, ...sentToCashier].reduce((sum, o) => sum + Number(o.total), 0);

    // Payment method breakdown
    const paymentMethods = orders.reduce((acc, o) => {
      const method = o.paymentMethod;
      if (!acc[method]) acc[method] = { count: 0, total: 0 };
      acc[method].count += 1;
      acc[method].total += Number(o.total);
      return acc;
    }, {} as Record<string, { count: number; total: number }>);

    // Delivery type breakdown
    const deliveryBreakdown = orders.reduce((acc, o) => {
      const type = o.deliveryType;
      if (!acc[type]) acc[type] = 0;
      acc[type] += 1;
      return acc;
    }, {} as Record<string, number>);

    // Best sellers
    const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
    for (const order of orders) {
      for (const item of order.items) {
        const pid = item.productId;
        if (!productSales[pid]) {
          productSales[pid] = { name: item.product?.name || "Unknown", quantity: 0, revenue: 0 };
        }
        productSales[pid].quantity += item.quantity;
        productSales[pid].revenue += Number(item.price) * item.quantity;
      }
    }
    const bestSellers = Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    // Time breakdown: hourly for daily, daily for monthly, monthly for yearly
    let timeBreakdown: { label: string; orders: number; revenue: number }[] = [];

    if (filter === "daily") {
      const hourlyData: Record<number, { orders: number; revenue: number }> = {};
      for (let h = 0; h < 24; h++) hourlyData[h] = { orders: 0, revenue: 0 };
      for (const order of orders) {
        const hour = new Date(order.createdAt).getHours();
        hourlyData[hour].orders += 1;
        hourlyData[hour].revenue += Number(order.total);
      }
      timeBreakdown = Object.entries(hourlyData)
        .map(([h, data]) => ({ label: `${h}:00`, ...data }))
        .filter((h) => parseInt(h.label) >= 6 && parseInt(h.label) <= 22);
    } else if (filter === "monthly") {
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const dailyData: Record<number, { orders: number; revenue: number }> = {};
      for (let d = 1; d <= daysInMonth; d++) dailyData[d] = { orders: 0, revenue: 0 };
      for (const order of orders) {
        const day = new Date(order.createdAt).getDate();
        dailyData[day].orders += 1;
        dailyData[day].revenue += Number(order.total);
      }
      timeBreakdown = Object.entries(dailyData).map(([d, data]) => ({ label: d, ...data }));
    } else {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const monthlyData: Record<number, { orders: number; revenue: number }> = {};
      for (let m = 0; m < 12; m++) monthlyData[m] = { orders: 0, revenue: 0 };
      for (const order of orders) {
        const month = new Date(order.createdAt).getMonth();
        monthlyData[month].orders += 1;
        monthlyData[month].revenue += Number(order.total);
      }
      timeBreakdown = Object.entries(monthlyData).map(([m, data]) => ({ label: monthNames[Number(m)], ...data }));
    }

    // Recent orders
    const recentOrders = orders.slice(0, 50).map((o) => ({
      id: o.id.slice(0, 8),
      customer: o.customer?.name || "Guest",
      items: o.items.length,
      total: Number(o.total),
      status: o.status,
      paymentMethod: o.paymentMethod,
      time: o.createdAt,
    }));

    return NextResponse.json({
      success: true,
      data: {
        period: { filter, label: periodLabel, start: rangeStart, end: rangeEnd },
        summary: {
          totalOrders: orders.length,
          pendingCount: pendingOrders.length,
          confirmedCount: confirmedOrders.length,
          preparingCount: preparingOrders.length,
          sentToCashierCount: sentToCashier.length,
          deliveredCount: deliveredOrders.length,
          totalRevenue,
          pendingRevenue,
          avgOrderValue: deliveredOrders.length > 0 ? totalRevenue / deliveredOrders.length : 0,
        },
        paymentMethods,
        deliveryBreakdown,
        bestSellers,
        timeBreakdown,
        recentOrders,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to generate report", error: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}
