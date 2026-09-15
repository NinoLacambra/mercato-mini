import crypto from "crypto";

import { NextResponse } from "next/server";
import {
  and,
  eq,
  gte,
  sql,
} from "drizzle-orm";

import { db } from "@/db";
import {
  orderItems,
  orders,
  products,
} from "@/db/schema";

function safeCompare(
  expected: string,
  received: string
) {
  try {
    const expectedBuffer =
      Buffer.from(expected);

    const receivedBuffer =
      Buffer.from(received);

    if (
      expectedBuffer.length !==
      receivedBuffer.length
    ) {
      return false;
    }

    return crypto.timingSafeEqual(
      expectedBuffer,
      receivedBuffer
    );
  } catch {
    return false;
  }
}

function verifyPayMongoSignature(
  rawBody: string,
  signatureHeader: string,
  secret: string
) {
  const parts = Object.fromEntries(
    signatureHeader
      .split(",")
      .map((part) => {
        const [key, ...value] =
          part.trim().split("=");

        return [
          key,
          value.join("="),
        ];
      })
  );

  const timestamp = parts.t;

  /*
   * We're currently using PayMongo TEST mode,
   * therefore we verify against "te".
   *
   * "li" is used for live mode.
   */
  const signature = parts.te;

  if (!timestamp || !signature) {
    return false;
  }

  const signedPayload =
    `${timestamp}.${rawBody}`;

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(signedPayload)
    .digest("hex");

  return safeCompare(
    expectedSignature,
    signature
  );
}

function getEventType(payload: any) {
  /*
   * Support the event envelope documented by
   * PayMongo's webhook/event APIs.
   */
  return (
    payload?.data?.attributes?.type ??
    payload?.data?.type ??
    null
  );
}

function getCheckoutSession(payload: any) {
  /*
   * Standard event envelope:
   *
   * data.attributes.data
   */
  if (
    payload?.data?.attributes?.data?.type ===
    "checkout_session"
  ) {
    return payload.data.attributes.data;
  }

  /*
   * Hosted Checkout webhook envelope:
   *
   * data.data
   */
  if (
    payload?.data?.data?.type ===
    "checkout_session"
  ) {
    return payload.data.data;
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const webhookSecret =
      process.env.PAYMONGO_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error(
        "PAYMONGO_WEBHOOK_SECRET is missing"
      );

      return NextResponse.json(
        {
          message:
            "Webhook secret is not configured",
        },
        {
          status: 500,
        }
      );
    }

    /*
     * IMPORTANT:
     *
     * Read the RAW body before JSON parsing.
     * PayMongo signs the exact request body.
     */
    const rawBody = await request.text();

    const signatureHeader =
      request.headers.get(
        "paymongo-signature"
      );

    if (!signatureHeader) {
      return NextResponse.json(
        {
          message:
            "Missing PayMongo signature",
        },
        {
          status: 401,
        }
      );
    }

    const validSignature =
      verifyPayMongoSignature(
        rawBody,
        signatureHeader,
        webhookSecret
      );

    if (!validSignature) {
      console.error(
        "Invalid PayMongo webhook signature"
      );

      return NextResponse.json(
        {
          message:
            "Invalid webhook signature",
        },
        {
          status: 401,
        }
      );
    }

    const payload = JSON.parse(rawBody);

    const eventType =
      getEventType(payload);

    /*
     * Ignore events we don't handle.
     */
    if (
      eventType !==
      "checkout_session.payment.paid"
    ) {
      return NextResponse.json({
        received: true,
        ignored: true,
      });
    }

    const checkoutSession =
      getCheckoutSession(payload);

    if (!checkoutSession) {
      console.error(
        "Checkout session missing from webhook"
      );

      return NextResponse.json(
        {
          message:
            "Checkout session missing",
        },
        {
          status: 400,
        }
      );
    }

    const attributes =
      checkoutSession.attributes;

    const referenceNumber =
      attributes?.reference_number;

    const metadata =
      attributes?.metadata ?? {};

    /*
     * Preferred:
     * metadata.order_id
     *
     * Fallback:
     * MERCATO-123
     */
    let orderId = Number(
      metadata.order_id
    );

    if (
      (!Number.isInteger(orderId) ||
        orderId <= 0) &&
      typeof referenceNumber === "string" &&
      referenceNumber.startsWith(
        "MERCATO-"
      )
    ) {
      orderId = Number(
        referenceNumber.replace(
          "MERCATO-",
          ""
        )
      );
    }

    if (
      !Number.isInteger(orderId) ||
      orderId <= 0
    ) {
      console.error(
        "Invalid Mercato order reference:",
        referenceNumber
      );

      return NextResponse.json(
        {
          message:
            "Invalid order reference",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Fulfill the order atomically.
     */
    await db.transaction(async (tx) => {
      const [order] = await tx
        .select()
        .from(orders)
        .where(eq(orders.id, orderId))
        .limit(1);

      if (!order) {
        throw new Error(
          `Order ${orderId} not found`
        );
      }

      /*
       * WEBHOOK IDEMPOTENCY
       *
       * PayMongo may send the same webhook
       * more than once.
       *
       * If we've already processed it,
       * don't reduce inventory again.
       */
      if (
        order.status === "paid" ||
        order.status === "completed" ||
        order.status === "processing" ||
        order.status === "shipped"
      ) {
        return;
      }

      if (order.status !== "pending") {
        throw new Error(
          `Order ${orderId} cannot be paid from status ${order.status}`
        );
      }

      const items = await tx
        .select()
        .from(orderItems)
        .where(
          eq(
            orderItems.orderId,
            orderId
          )
        );

      if (items.length === 0) {
        throw new Error(
          `Order ${orderId} has no items`
        );
      }

      /*
       * Reduce inventory.
       *
       * The WHERE condition ensures stock
       * cannot become negative.
       */
      for (const item of items) {
        const [updatedProduct] =
          await tx
            .update(products)
            .set({
              stock: sql`
                ${products.stock}
                - ${item.quantity}
              `,
            })
            .where(
              and(
                eq(
                  products.id,
                  item.productId
                ),
                gte(
                  products.stock,
                  item.quantity
                )
              )
            )
            .returning({
              id: products.id,
            });

        if (!updatedProduct) {
          throw new Error(
            `Insufficient stock for product ${item.productId}`
          );
        }
      }

      /*
       * Payment is confirmed.
       */
      await tx
        .update(orders)
        .set({
          status: "paid",
        })
        .where(
          eq(orders.id, orderId)
        );
    });

    console.log(
      `PayMongo payment completed for order ${orderId}`
    );

    return NextResponse.json({
      received: true,
      orderId,
    });
  } catch (error) {
    console.error(
      "PayMongo webhook error:",
      error
    );

    /*
     * Return 500 so PayMongo knows processing
     * failed rather than falsely acknowledging it.
     */
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Webhook processing failed",
      },
      {
        status: 500,
      }
    );
  }
}