import {
  pgSchema,
  serial,
  text,
  timestamp,
  integer,
  numeric,
} from "drizzle-orm/pg-core";

export const mercato = pgSchema("mercato");

export const products = mercato.table("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: numeric("price", {
    precision: 12,
    scale: 2,
  }).notNull(),
  stock: integer("stock").notNull().default(0),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orders = mercato.table("orders", {
  id: serial("id").primaryKey(),
  customerEmail: text("customer_email").notNull(),
  status: text("status").notNull().default("pending"),
  totalAmount: numeric("total_amount", {
    precision: 12,
    scale: 2,
  }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orderItems = mercato.table("order_items", {
  id: serial("id").primaryKey(),

  orderId: integer("order_id")
    .references(() => orders.id, {
      onDelete: "cascade",
    })
    .notNull(),

  productId: integer("product_id")
    .references(() => products.id)
    .notNull(),

  quantity: integer("quantity").notNull(),

  price: numeric("price", {
    precision: 12,
    scale: 2,
  }).notNull(),
});