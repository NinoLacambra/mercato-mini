# Mercato Mini

A full-stack e-commerce application built with Next.js, PostgreSQL, Supabase, Drizzle ORM, and PayMongo.

Mercato Mini demonstrates a complete online shopping flow — from product browsing and cart management to hosted payments, webhook-based payment verification, inventory updates, and a protected admin dashboard.

## Live Demo

https://mercato-mini.netlify.app/

## Features

### Storefront
- Responsive product catalog
- Product images and stock availability
- Shopping cart
- Quantity controls
- Automatic order total calculation
- Checkout with customer email
- PHP currency formatting

### Payments
- PayMongo Hosted Checkout
- Card, GCash, and QR Ph support
- Server-side price calculation
- Pending order creation before payment
- PayMongo webhook integration
- HMAC webhook signature verification
- Idempotent payment fulfillment
- Automatic inventory deduction after confirmed payment
- Payment success and order confirmation flow

### Admin Dashboard
- Supabase Auth authentication
- Server-side admin authorization
- Protected admin routes
- Protected product and order mutation APIs
- Revenue overview
- Order count
- Product count
- Low-stock monitoring
- Product creation, editing, and deletion
- Inventory management
- Order status management
- Admin logout

## Tech Stack

- Next.js
- TypeScript
- React
- Tailwind CSS
- PostgreSQL
- Supabase
- Supabase Auth
- Drizzle ORM
- Zod
- PayMongo
- Lucide React
- Netlify

## Architecture

```text
Customer
   |
   v
Next.js Storefront
   |
   +---- Product Catalog
   |
   +---- Shopping Cart
   |
   v
Checkout API
   |
   +---- Validate products and stock
   +---- Calculate prices server-side
   +---- Create pending order
   |
   v
PayMongo Hosted Checkout
   |
   v
Successful Payment
   |
   v
PayMongo Webhook
   |
   +---- Verify webhook signature
   +---- Locate Mercato order
   +---- Prevent duplicate fulfillment
   +---- Deduct inventory
   +---- Mark order as paid
   |
   v
PostgreSQL / Supabase
```

## Database

Mercato Mini uses PostgreSQL hosted on Supabase.

Application tables are isolated in the `mercato` PostgreSQL schema:

```text
mercato
├── products
├── orders
└── order_items
```

Drizzle migration history is stored separately:

```text
drizzle_mercato
└── __drizzle_migrations
```

This allows the same Supabase PostgreSQL project to support multiple applications while keeping their data and migration histories isolated.

## Payment Flow

Mercato does not trust prices or payment status sent by the browser.

When checkout begins:

1. The server retrieves products directly from PostgreSQL.
2. Product prices and available stock are validated.
3. The total is calculated server-side.
4. A pending order and its order items are created.
5. A PayMongo Checkout Session is created.
6. The customer completes payment through PayMongo.
7. PayMongo sends a signed webhook to Mercato.
8. Mercato verifies the webhook signature.
9. Inventory is deducted inside a database transaction.
10. The order is marked as paid.

Webhook processing is idempotent to prevent the same payment event from deducting inventory more than once.

## Authentication

The admin dashboard uses Supabase Auth.

Protected routes include:

```text
/admin
/admin/products
/admin/orders
```

Authentication alone does not grant administrator access. The authenticated Supabase user's email is also validated server-side against the configured Mercato administrator.

Administrative API operations are protected independently from the UI.

## Environment Variables

Create a `.env.local` file:

```env
DATABASE_URL=

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=

ADMIN_EMAIL=
NEXT_PUBLIC_ADMIN_EMAIL=

PAYMONGO_SECRET_KEY=
PAYMONGO_WEBHOOK_SECRET=
```

Never commit real environment variables or API secrets.

## Local Development

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Database Migrations

Generate migrations:

```bash
npx drizzle-kit generate
```

Apply migrations:

```bash
npx drizzle-kit migrate
```

## Production Build

```bash
npm run build
```

## Deployment

Mercato Mini is deployed on Netlify.

The production PayMongo webhook endpoint is:

```text
/api/webhooks/paymongo
```

The webhook listens for successful Checkout Session payment events and performs server-side order fulfillment.

## Project Purpose

Mercato Mini was built as a portfolio project to demonstrate practical full-stack e-commerce development, including:

- relational database design
- server-side validation
- payment gateway integration
- webhook security
- transactional inventory management
- authentication and authorization
- protected APIs
- responsive frontend development
- production deployment

## Author

Niño C. Lacambra

Full-Stack Engineer