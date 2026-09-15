import type { Metadata } from "next";
import "./globals.css";

import { CartProvider } from "@/components/cart/cart-provider";

export const metadata: Metadata = {
  title: "Mercato Mini",
  description: "Full-stack e-commerce demo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}