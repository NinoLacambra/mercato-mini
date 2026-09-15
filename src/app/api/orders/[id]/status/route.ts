import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { orders } from "@/db/schema";

const statusSchema = z.object({
  status: z.enum([
    "pending",
    "processing",
    "shipped",
    "completed",
    "cancelled",
  ]),
});

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await context.params;
    const orderId = Number(id);

    if (!Number.isInteger(orderId) || orderId <= 0) {
      return NextResponse.json(
        { message: "Invalid order ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const result = statusSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: "Invalid order status" },
        { status: 400 }
      );
    }

    const [updatedOrder] = await db
      .update(orders)
      .set({
        status: result.data.status,
      })
      .where(eq(orders.id, orderId))
      .returning();

    if (!updatedOrder) {
      return NextResponse.json(
        { message: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Order status updated",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Update order status error:", error);

    return NextResponse.json(
      { message: "Failed to update order status" },
      { status: 500 }
    );
  }
}