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

    // Payment status counts
    const pendingPayment = orders.filter((o) => o.paymentStatus === "Pending");
    const verifiedPayments = orders.filter((o) => o.paymentStatus === "Verified");
    const rejectedPayments = orders.filter((o) => o.paymentStatus === "Rejected");

    // Status counts
    const deliveredOrders = orders.filter((o) => o.status === "Delivered");
    const outForDelivery = orders.filter((o) => o.status === "Out_for_Delivery");

    // Revenue
    const totalCollected = verifiedPayments.reduce((sum, o) => sum + Number(o.total), 0);
    const pendingCollection = pendingPayment.reduce((sum, o) => sum + Number(o.total), 0);
    const deliveryRevenue = deliveredOrders.filter((o) => o.deliveryType === "Delivery").reduce((sum, o) => sum + Number(o.deliveryFee), 0);

    // Payment method breakdown
    const paymentMethods = orders.reduce((acc, o) => {
      const method = o.paymentMethod;
      if (!acc[method]) acc[method] = { count: 0, total: 0, verified: 0, pending: 0 };
      acc[method].count += 1;
      acc[method].total += Number(o.total);
      if (o.paymentStatus === "Verified") acc[method].verified += Number(o.total);
      if (o.paymentStatus === "Pending") acc[method].pending += Number(o.total);
      return acc;
    }, {} as Record<string, { count: number; total: number; verified: number; pending: number }>);

    // Time breakdown
    let timeBreakdown: { label: string; collected: number; orders: number }[] = [];

    if (filter === "daily") {
      const hourlyData: Record<number, { collected: number; orders: number }> = {};
      for (let h = 0; h < 24; h++) hourlyData[h] = { collected: 0, orders: 0 };
      for (const order of orders) {
        const hour = new Date(order.createdAt).getHours();
        hourlyData[hour].orders += 1;
        if (order.paymentStatus === "Verified") hourlyData[hour].collected += Number(order.total);
      }
      timeBreakdown = Object.entries(hourlyData)
        .map(([h, data]) => ({ label: `${h}:00`, ...data }))
        .filter((h) => parseInt(h.label) >= 6 && parseInt(h.label) <= 22);
    } else if (filter === "monthly") {
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const dailyData: Record<number, { collected: number; orders: number }> = {};
      for (let d = 1; d <= daysInMonth; d++) dailyData[d] = { collected: 0, orders: 0 };
      for (const order of orders) {
        const day = new Date(order.createdAt).getDate();
        dailyData[day].orders += 1;
        if (order.paymentStatus === "Verified") dailyData[day].collected += Number(order.total);
      }
      timeBreakdown = Object.entries(dailyData).map(([d, data]) => ({ label: d, ...data }));
    } else {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const monthlyData: Record<number, { collected: number; orders: number }> = {};
      for (let m = 0; m < 12; m++) monthlyData[m] = { collected: 0, orders: 0 };
      for (const order of orders) {
        const month = new Date(order.createdAt).getMonth();
        monthlyData[month].orders += 1;
        if (order.paymentStatus === "Verified") monthlyData[month].collected += Number(order.total);
      }
      timeBreakdown = Object.entries(monthlyData).map(([m, data]) => ({ label: monthNames[Number(m)], ...data }));
    }

    // Recent payment transactions
    const recentOrders = orders
      .filter((o) => o.paymentStatus !== "Pending" || o.status === "Out_for_Delivery")
      .slice(0, 50)
      .map((o) => ({
        id: o.id.slice(0, 8),
        customer: o.customer?.name || "Guest",
        total: Number(o.total),
        paymentMethod: o.paymentMethod,
        paymentStatus: o.paymentStatus,
        status: o.status,
        time: o.createdAt,
      }));

    return NextResponse.json({
      success: true,
      data: {
        period: { filter, label: periodLabel, start: rangeStart, end: rangeEnd },
        summary: {
          totalOrders: orders.length,
          pendingPaymentCount: pendingPayment.length,
          verifiedCount: verifiedPayments.length,
          rejectedCount: rejectedPayments.length,
          deliveredCount: deliveredOrders.length,
          outForDeliveryCount: outForDelivery.length,
          totalCollected,
          pendingCollection,
          deliveryRevenue,
        },
        paymentMethods,
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
