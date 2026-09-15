import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { products } from "@/db/schema";

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
    const secretKey = process.env.PAYMONGO_SECRET_KEY;

    if (!secretKey) {
      return NextResponse.json(
        {
          message: "PAYMONGO_SECRET_KEY is not configured",
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

    /*
     * IMPORTANT:
     * Never trust prices sent by the browser.
     *
     * We retrieve every product directly from PostgreSQL
     * and use the database price.
     */
    const lineItems = [];

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

      /*
       * PayMongo expects amounts in centavos.
       *
       * ₱1,499.00
       * becomes
       * 149900
       */
      const amount = Math.round(
        Number(product.price) * 100
      );

      lineItems.push({
        name: product.name,
        description:
          product.description || product.name,
        amount,
        currency: "PHP",
        quantity: item.quantity,
      });
    }

    /*
     * PayMongo requires fully qualified redirect URLs.
     *
     * request.nextUrl.origin automatically gives us:
     *
     * development:
     * http://localhost:3000
     *
     * production:
     * https://your-domain.com
     */
    const origin = new URL(request.url).origin;

    const referenceNumber = `MERCATO-${Date.now()}`;

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

              success_url: `${origin}/checkout/payment-success`,
              cancel_url: `${origin}/checkout`,

              reference_number: referenceNumber,

              send_email_receipt: true,

              metadata: {
                customer_email: customerEmail,
              },
            },
          },
        }),
      }
    );

    const paymongoData = await paymongoResponse.json();

    if (!paymongoResponse.ok) {
      console.error(
        "PayMongo checkout error:",
        paymongoData
      );

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
      referenceNumber,
      checkoutSessionId: paymongoData.data.id,
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