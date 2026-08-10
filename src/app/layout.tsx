import type { Metadata, Viewport } from "next";
import { BottomNav } from "@/components/BottomNav";
import "./globals.css";

export const metadata: Metadata = { title: "Futbol" };
export const viewport: Viewport = { width: "device-width", initialScale: 1, maximumScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className="mx-auto max-w-md pb-16">
        <main>{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
