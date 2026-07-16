import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateMode = searchParams.get("dateMode") || "All";
    const filterDate = searchParams.get("filterDate") || "";
    const filterMonth = searchParams.get("filterMonth") || "";
    const filterYear = searchParams.get("filterYear") || "";
    const productSearch = searchParams.get("productSearch") || "";

    const now = new Date();

    // Build date filter for orders
    let dateFilter: any = {};
    if (dateMode === "Date" && filterDate) {
      const selected = new Date(filterDate + "T00:00:00");
      const dayEnd = new Date(selected);
      dayEnd.setDate(dayEnd.getDate() + 1);
      dateFilter = { createdAt: { gte: selected, lt: dayEnd } };
    } else if (dateMode === "Month" && filterMonth) {
      const [y, m] = filterMonth.split("-").map(Number);
      const monthStart = new Date(y, m - 1, 1);
      const monthEnd = new Date(y, m, 1);
      dateFilter = { createdAt: { gte: monthStart, lt: monthEnd } };
    } else if (dateMode === "Year" && filterYear) {
      const yearStart = new Date(Number(filterYear), 0, 1);
      const yearEnd = new Date(Number(filterYear) + 1, 0, 1);
      dateFilter = { createdAt: { gte: yearStart, lt: yearEnd } };
    }

    // Best sellers with date filter
    const bestSelling = await prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true, price: true },
      where: {
        order: {
          status: { not: "Cancelled" },
          ...dateFilter,
        },
      },
      orderBy: { _sum: { quantity: "desc" } },
    });

    const productIds = bestSelling.map((b) => b.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true },
    });

    let bestSellersData = bestSelling.map((b) => {
      const qty = b._sum.quantity || 0;
      const revenue = qty * Number(b._sum.price || 0);
      return {
        name: products.find((p) => p.id === b.productId)?.name || "Unknown",
        quantity: qty,
        revenue,
      };
    });

    // Filter by product name
    if (productSearch.trim()) {
      const search = productSearch.toLowerCase();
      bestSellersData = bestSellersData.filter((p) =>
        p.name.toLowerCase().includes(search)
      );
    }

    const totalQuantitySold = bestSellersData.reduce((sum, p) => sum + p.quantity, 0);
    const totalRevenue = bestSellersData.reduce((sum, p) => sum + p.revenue, 0);

    // Weekly sales with date filter
    const weeklySales: { week: string; sales: number; orders: number }[] = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - (i * 7 + weekStart.getDay()));
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const weekOrders = await prisma.order.findMany({
        where: {
          createdAt: { gte: weekStart, lt: weekEnd },
          status: { not: "Cancelled" },
        },
        select: { total: true },
      });

      weeklySales.push({
        week: `Week ${4 - i}`,
        sales: weekOrders.reduce((sum, o) => sum + Number(o.total), 0),
        orders: weekOrders.length,
      });
    }

    // Summary stats with date filter
    const summaryWhere: any = { status: { not: "Cancelled" } };
    if (dateMode !== "All") {
      if (dateMode === "Date" && filterDate) {
        const selected = new Date(filterDate + "T00:00:00");
        const dayEnd = new Date(selected);
        dayEnd.setDate(dayEnd.getDate() + 1);
        summaryWhere.createdAt = { gte: selected, lt: dayEnd };
      } else if (dateMode === "Month" && filterMonth) {
        const [y, m] = filterMonth.split("-").map(Number);
        const monthStart = new Date(y, m - 1, 1);
        const monthEnd = new Date(y, m, 1);
        summaryWhere.createdAt = { gte: monthStart, lt: monthEnd };
      } else if (dateMode === "Year" && filterYear) {
        const yearStart = new Date(Number(filterYear), 0, 1);
        const yearEnd = new Date(Number(filterYear) + 1, 0, 1);
        summaryWhere.createdAt = { gte: yearStart, lt: yearEnd };
      }
    }

    const allOrders = await prisma.order.findMany({
      where: summaryWhere,
      select: { total: true },
    });

    const allTimeRevenue = allOrders.reduce((sum, o) => sum + Number(o.total), 0);
    const allTimeCount = allOrders.length;
    const avgOrderValue = allTimeCount > 0 ? allTimeRevenue / allTimeCount : 0;

    return NextResponse.json({
      success: true,
      data: {
        weeklySales,
        bestSellersData,
        totalSales: allTimeRevenue,
        totalOrders: allTimeCount,
        avgOrderValue,
        totalQuantitySold,
        totalRevenue,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch reports", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
