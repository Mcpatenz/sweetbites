import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Fetch all products with category
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch products",
      },
      { status: 500 },
    );
  }
}

// POST - Create a new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (
      !body.name ||
      !body.categoryId ||
      !body.price ||
      body.stock === undefined
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields: name, categoryId, price, stock",
        },
        { status: 400 },
      );
    }

    // Validate price and stock
    if (isNaN(body.price) || body.price < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Price must be a valid positive number",
        },
        { status: 400 },
      );
    }

    if (isNaN(body.stock) || body.stock < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Stock must be a valid non-negative number",
        },
        { status: 400 },
      );
    }

    // Check if category exists (if using foreign key)
    const categoryExists = await prisma.category.findUnique({
      where: { id: body.categoryId },
    });

    if (!categoryExists) {
      // Create the category if it doesn't exist
      await prisma.category.create({
        data: {
          id: body.categoryId,
          name:
            body.categoryId.charAt(0).toUpperCase() + body.categoryId.slice(1),
        },
      });
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        name: body.name.trim(),
        categoryId: body.categoryId,
        description: body.description || null,
        price: parseFloat(body.price),
        stock: parseInt(body.stock, 10),
        image: body.image || null,
        rating: 0,
        reviews: 0,
        archived: false,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: product,
      message: "Product created successfully",
    });
  } catch (error) {
    console.error("Error creating product:", error);

    // Handle specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes("Foreign key constraint")) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid category. Please select a valid category.",
          },
          { status: 400 },
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to create product",
      },
      { status: 500 },
    );
  }
}
