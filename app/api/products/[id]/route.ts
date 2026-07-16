import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { unlink } from "fs/promises";
import { join } from "path";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Product fetched successfully",
      data: {
        ...product,
        price: Number(product.price),
        rating: product.rating ? Number(product.rating) : undefined,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch product",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 },
      );
    }

    if (existing.image && body.image && existing.image !== body.image) {
      const oldPath = join(process.cwd(), "public", existing.image);
      await unlink(oldPath).catch(() => {});
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        categoryId: body.categoryId ?? existing.categoryId,
        name: body.name ?? existing.name,
        description: body.description !== undefined ? body.description : existing.description,
        price: body.price ?? existing.price,
        stock: body.stock ?? existing.stock,
        image: body.image !== undefined ? body.image : existing.image,
        archived: body.archived !== undefined ? body.archived : existing.archived,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
      data: {
        ...updated,
        price: Number(updated.price),
        rating: updated.rating ? Number(updated.rating) : undefined,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update product",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 },
      );
    }

    if (existing.image) {
      const imgPath = join(process.cwd(), "public", existing.image);
      await unlink(imgPath).catch(() => {});
    }

    await prisma.product.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete product",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
