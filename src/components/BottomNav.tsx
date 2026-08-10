"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/arama", label: "Ara" },
  { href: "/taktik", label: "Taktik" },
  { href: "/favoriler", label: "Favoriler" },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 flex border-t border-border bg-surface/95 backdrop-blur">
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 py-2.5 text-center text-xs ${
              active ? "text-accent" : "text-neutral-500"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
