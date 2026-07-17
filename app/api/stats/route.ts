import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [
      totalCustomers,
      totalProducts,
      deliveredOrders,
      fiveStarReviews,
      totalReviews,
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.product.count({ where: { archived: false } }),
      prisma.order.count({ where: { status: "Delivered" } }),
      prisma.review.count({ where: { rating: 5 } }),
      prisma.review.count(),
    ]);

    const avgRating =
      totalReviews > 0
        ? (
            (await prisma.review.aggregate({ _avg: { rating: true } }))
              ._avg.rating || 0
          ).toFixed(1)
        : "0.0";

    return NextResponse.json({
      success: true,
      data: {
        happyCustomers: totalCustomers,
        deliciousTreats: totalProducts,
        ordersDelivered: deliveredOrders,
        fiveStarReviews,
        totalReviews,
        averageRating: avgRating,
        yearsOfExcellence: new Date().getFullYear() - 2020,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch stats",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
