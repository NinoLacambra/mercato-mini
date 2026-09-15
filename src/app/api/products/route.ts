import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { products } from "@/db/schema";

const productSchema = z.object({
  name: z.string().trim().min(1, "Product name is required"),
  description: z.string().trim().optional(),
  price: z.coerce.number().positive("Price must be greater than 0"),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
  imageUrl: z.string().trim().optional(),
});

const updateProductSchema = productSchema.extend({
  id: z.coerce.number().int().positive("Invalid product ID"),
});

export async function GET() {
  try {
    const data = await db
      .select()
      .from(products)
      .orderBy(desc(products.createdAt));

    return NextResponse.json(data);
  } catch (error) {
    console.error("GET products error:", error);

    return NextResponse.json(
      { message: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = productSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          message: "Invalid product data",
          errors: result.error.flatten(),
        },
        { status: 400 }
      );
    }

    const [product] = await db
      .insert(products)
      .values({
        name: result.data.name,
        description: result.data.description || null,
        price: result.data.price.toFixed(2),
        stock: result.data.stock,
        imageUrl: result.data.imageUrl || null,
      })
      .returning();

    return NextResponse.json(product, {
      status: 201,
    });
  } catch (error) {
    console.error("POST product error:", error);

    return NextResponse.json(
      { message: "Failed to create product" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    const result = updateProductSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          message: "Invalid product data",
          errors: result.error.flatten(),
        },
        { status: 400 }
      );
    }

    const [updatedProduct] = await db
      .update(products)
      .set({
        name: result.data.name,
        description: result.data.description || null,
        price: result.data.price.toFixed(2),
        stock: result.data.stock,
        imageUrl: result.data.imageUrl || null,
      })
      .where(eq(products.id, result.data.id))
      .returning();

    if (!updatedProduct) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Product updated",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("PATCH product error:", error);

    return NextResponse.json(
      { message: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { message: "Invalid product ID" },
        { status: 400 }
      );
    }

    const [deletedProduct] = await db
      .delete(products)
      .where(eq(products.id, id))
      .returning();

    if (!deletedProduct) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Product deleted",
      product: deletedProduct,
    });
  } catch (error) {
    console.error("DELETE product error:", error);

    return NextResponse.json(
      { message: "Failed to delete product" },
      { status: 500 }
    );
  }
}