"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  {
    href: "/",
    label: "Ana Sayfa",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#3ddc84" : "#6b7280"} strokeWidth="2">
        <path d="M3 11.5 12 4l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/arama",
    label: "Ara",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#3ddc84" : "#6b7280"} strokeWidth="2">
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/taktik",
    label: "Taktik",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#3ddc84" : "#6b7280"} strokeWidth="2">
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <circle cx="12" cy="9" r="2" />
        <path d="M8 17c0-2 1.8-3 4-3s4 1 4 3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/favoriler",
    label: "Favoriler",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "#3ddc84" : "none"} stroke={active ? "#3ddc84" : "#6b7280"} strokeWidth="2">
        <path d="M12 20s-7-4.4-9.5-8.6C.8 8 2.2 4.5 5.6 4c2-.3 3.7.7 4.4 2 .7-1.3 2.4-2.3 4.4-2 3.4.5 4.8 4 3.1 7.4C19 15.6 12 20 12 20Z" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 mx-auto flex max-w-md border-t border-border bg-surface/95 backdrop-blur">
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-1 flex-col items-center gap-0.5 py-2.5"
          >
            {item.icon(active)}
            <span className={`text-[10px] ${active ? "font-medium text-accent" : "text-neutral-500"}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
