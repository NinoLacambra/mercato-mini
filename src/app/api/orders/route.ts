import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { orderItems, orders, products } from "@/db/schema";

const checkoutSchema = z.object({
  customerEmail: z.string().email(),
  items: z
    .array(
      z.object({
        productId: z.number().int().positive(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = checkoutSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          message: "Invalid checkout data",
          errors: result.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { customerEmail, items } = result.data;

    const createdOrder = await db.transaction(async (tx) => {
      let totalAmount = 0;

      const resolvedItems = [];

      for (const item of items) {
        const [product] = await tx
          .select()
          .from(products)
          .where(eq(products.id, item.productId))
          .limit(1);

        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }

        if (product.stock < item.quantity) {
          throw new Error(`Not enough stock for ${product.name}`);
        }

        totalAmount += Number(product.price) * item.quantity;

        resolvedItems.push({
          product,
          quantity: item.quantity,
        });
      }

      const [order] = await tx
        .insert(orders)
        .values({
          customerEmail,
          status: "pending",
          totalAmount: totalAmount.toFixed(2),
        })
        .returning();

      for (const item of resolvedItems) {
        await tx.insert(orderItems).values({
          orderId: order.id,
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
        });

        await tx
          .update(products)
          .set({
            stock: sql`${products.stock} - ${item.quantity}`,
          })
          .where(eq(products.id, item.product.id));
      }

      return order;
    });

    return NextResponse.json(
      {
        message: "Order created successfully",
        order: createdOrder,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create order error:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to create order",
      },
      { status: 500 }
    );
  }
}