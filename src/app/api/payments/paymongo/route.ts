import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import {
  orderItems,
  orders,
  products,
} from "@/db/schema";

const paymentSchema = z.object({
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
    const secretKey =
      process.env.PAYMONGO_SECRET_KEY;

    if (!secretKey) {
      return NextResponse.json(
        {
          message:
            "PAYMONGO_SECRET_KEY is not configured",
        },
        {
          status: 500,
        }
      );
    }

    const body = await request.json();

    const result = paymentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          message: "Invalid payment data",
          errors: result.error.flatten(),
        },
        {
          status: 400,
        }
      );
    }

    const { customerEmail, items } = result.data;

    const resolvedItems: {
      product: typeof products.$inferSelect;
      quantity: number;
    }[] = [];

    const lineItems = [];

    let totalAmount = 0;

    /*
     * Always retrieve product prices from the DB.
     * Never trust prices from the browser.
     */
    for (const item of items) {
      const [product] = await db
        .select()
        .from(products)
        .where(eq(products.id, item.productId))
        .limit(1);

      if (!product) {
        return NextResponse.json(
          {
            message: `Product ${item.productId} not found`,
          },
          {
            status: 404,
          }
        );
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          {
            message: `Not enough stock for ${product.name}`,
          },
          {
            status: 400,
          }
        );
      }

      const price = Number(product.price);

      totalAmount += price * item.quantity;

      resolvedItems.push({
        product,
        quantity: item.quantity,
      });

      lineItems.push({
        name: product.name,

        description:
          product.description || product.name,

        amount: Math.round(price * 100),

        currency: "PHP",

        quantity: item.quantity,
      });
    }

    /*
     * Create a PENDING Mercato order.
     *
     * Important:
     * We are NOT reducing stock here.
     */
    const order = await db.transaction(
      async (tx) => {
        const [createdOrder] = await tx
          .insert(orders)
          .values({
            customerEmail,
            status: "pending",
            totalAmount: totalAmount.toFixed(2),
          })
          .returning();

        for (const item of resolvedItems) {
          await tx.insert(orderItems).values({
            orderId: createdOrder.id,
            productId: item.product.id,
            quantity: item.quantity,
            price: item.product.price,
          });
        }

        return createdOrder;
      }
    );

    /*
     * This connects PayMongo to our internal order.
     */
    const referenceNumber = `MERCATO-${order.id}`;

    const origin = new URL(request.url).origin;

    const authorization = Buffer.from(
      `${secretKey}:`
    ).toString("base64");

    const paymongoResponse = await fetch(
      "https://api.paymongo.com/v2/checkout_sessions",
      {
        method: "POST",

        headers: {
          Authorization: `Basic ${authorization}`,
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          data: {
            attributes: {
              line_items: lineItems,

              payment_method_types: [
                "card",
                "gcash",
                "qrph",
              ],

              success_url: `${origin}/checkout/payment-success?order=${order.id}`,

              cancel_url: `${origin}/checkout`,

              reference_number: referenceNumber,

              send_email_receipt: true,

              metadata: {
                order_id: String(order.id),
                customer_email: customerEmail,
              },
            },
          },
        }),
      }
    );

    const paymongoData =
      await paymongoResponse.json();

    if (!paymongoResponse.ok) {
      console.error(
        "PayMongo checkout error:",
        paymongoData
      );

      /*
       * Checkout session creation failed.
       *
       * Remove the pending order because
       * payment never actually started.
       *
       * order_items are removed automatically
       * because order_id uses ON DELETE CASCADE.
       */
      await db
        .delete(orders)
        .where(eq(orders.id, order.id));

      return NextResponse.json(
        {
          message:
            paymongoData?.errors?.[0]?.detail ||
            "Failed to create PayMongo checkout",
        },
        {
          status: paymongoResponse.status,
        }
      );
    }

    const checkoutUrl =
      paymongoData.data?.attributes?.checkout_url;

    if (!checkoutUrl) {
      await db
        .delete(orders)
        .where(eq(orders.id, order.id));

      return NextResponse.json(
        {
          message:
            "PayMongo did not return a checkout URL",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      checkoutUrl,

      orderId: order.id,

      referenceNumber,

      checkoutSessionId:
        paymongoData.data.id,
    });
  } catch (error) {
    console.error(
      "Create PayMongo checkout error:",
      error
    );

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to create payment",
      },
      {
        status: 500,
      }
    );
  }
}