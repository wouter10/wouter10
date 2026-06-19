"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  {
    href: "/",
    label: "Rollen",
    icon: (active: boolean) => (
      <svg
        viewBox="0 0 24 24"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={active ? 0 : 1.8}
        className="w-6 h-6"
      >
        <rect x="3" y="3" width="18" height="18" rx="4" />
        <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
        <circle cx="15.5" cy="8.5" r="1.5" fill="currentColor" />
        <circle cx="8.5" cy="15.5" r="1.5" fill="currentColor" />
        <circle cx="15.5" cy="15.5" r="1.5" fill="currentColor" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    href: "/categories",
    label: "Lijsten",
    icon: (active: boolean) => (
      <svg
        viewBox="0 0 24 24"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={active ? 0 : 1.8}
        className="w-6 h-6"
      >
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path
          d="M8 8h8M8 12h8M8 16h5"
          stroke={active ? "white" : "currentColor"}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    href: "/history",
    label: "Geschiedenis",
    icon: (active: boolean) => (
      <svg
        viewBox="0 0 24 24"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={active ? 0 : 1.8}
        className="w-6 h-6"
      >
        <circle cx="12" cy="12" r="9" />
        <path
          d="M12 7v5l3 3"
          stroke={active ? "white" : "currentColor"}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/chat",
    label: "Chat",
    icon: (active: boolean) => (
      <svg
        viewBox="0 0 24 24"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={active ? 0 : 1.8}
        className="w-6 h-6"
      >
        <path d="M20 2H4a2 2 0 00-2 2v12a2 2 0 002 2h4l4 4 4-4h4a2 2 0 002-2V4a2 2 0 00-2-2z" />
        <path
          d="M8 10h8M8 14h5"
          stroke={active ? "white" : "currentColor"}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="shrink-0 z-40 bg-[var(--card)]/90 backdrop-blur-xl border-t border-[var(--card-border)] pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-stretch h-14">
        {tabs.map((tab) => {
          const active =
            tab.href === "/"
              ? pathname === "/"
              : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={[
                "flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors duration-150",
                active
                  ? "text-brand-500"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]",
              ].join(" ")}
            >
              {tab.icon(active)}
              <span className="text-[10px] font-medium leading-none">
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
