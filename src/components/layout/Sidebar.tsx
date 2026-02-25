"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Upload, Calculator, DollarSign } from "lucide-react";
import Logo from "./Logo";
import { tools } from "@/lib/tools-config";
import type { ToolIconName } from "@/lib/tools-config";

const iconMap: Record<ToolIconName, React.ComponentType<{ className?: string }>> = {
  Upload,
  Calculator,
  DollarSign,
};

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col bg-[var(--payaptic-sidebar-bg)] text-[var(--payaptic-sidebar-text)]">
      <div className="flex h-16 items-center px-4 border-b border-white/10">
        <Logo />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Navigation
        </div>

        <Link
          href="/dashboard"
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
            pathname === "/dashboard"
              ? "bg-[var(--payaptic-sidebar-hover)] text-white"
              : "text-slate-300 hover:bg-[var(--payaptic-sidebar-hover)] hover:text-white"
          }`}
        >
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </Link>

        <div className="mt-6 mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Tools
        </div>

        {tools.map((tool) => {
          const Icon = iconMap[tool.iconName];
          const isActive = pathname === tool.route;
          const isComingSoon = tool.status === "coming-soon";

          return (
            <Link
              key={tool.id}
              href={isComingSoon ? "#" : tool.route}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-[var(--payaptic-sidebar-hover)] text-white"
                  : isComingSoon
                    ? "cursor-not-allowed text-slate-500"
                    : "text-slate-300 hover:bg-[var(--payaptic-sidebar-hover)] hover:text-white"
              }`}
              onClick={isComingSoon ? (e) => e.preventDefault() : undefined}
            >
              <Icon className="h-4 w-4" />
              <span className="flex-1">{tool.name}</span>
              {isComingSoon && (
                <span className="rounded-full bg-slate-600 px-2 py-0.5 text-xs">
                  Soon
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
