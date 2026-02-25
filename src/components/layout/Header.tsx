"use client";

import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { ChevronRight } from "lucide-react";

function buildBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  return segments.map((segment, index) => ({
    label: segment
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()),
    href: "/" + segments.slice(0, index + 1).join("/"),
    isLast: index === segments.length - 1,
  }));
}

export default function Header() {
  const pathname = usePathname();
  const breadcrumbs = buildBreadcrumbs(pathname);

  return (
    <header className="flex h-16 items-center justify-between border-b border-[var(--payaptic-border)] bg-[var(--payaptic-surface)] px-6">
      <nav className="flex items-center gap-1 text-sm">
        {breadcrumbs.map((crumb) => (
          <span key={crumb.href} className="flex items-center gap-1">
            {crumb.href !== breadcrumbs[0]?.href && (
              <ChevronRight className="h-3 w-3 text-[var(--payaptic-text-muted)]" />
            )}
            <span
              className={
                crumb.isLast
                  ? "font-medium text-[var(--payaptic-text)]"
                  : "text-[var(--payaptic-text-muted)]"
              }
            >
              {crumb.label}
            </span>
          </span>
        ))}
      </nav>

      <UserButton afterSignOutUrl="/" />
    </header>
  );
}
