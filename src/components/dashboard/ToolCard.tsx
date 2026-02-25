"use client";

import Link from "next/link";
import { ArrowRight, Upload, Calculator, DollarSign } from "lucide-react";
import type { ToolConfig, ToolIconName } from "@/lib/tools-config";

const iconMap: Record<ToolIconName, React.ComponentType<{ className?: string }>> = {
  Upload,
  Calculator,
  DollarSign,
};

interface ToolCardProps {
  tool: ToolConfig;
}

export default function ToolCard({ tool }: ToolCardProps) {
  const Icon = iconMap[tool.iconName];
  const isComingSoon = tool.status === "coming-soon";

  return (
    <Link
      href={isComingSoon ? "#" : tool.route}
      onClick={isComingSoon ? (e) => e.preventDefault() : undefined}
      className={`group relative flex flex-col rounded-xl border bg-[var(--payaptic-surface)] p-6 transition-shadow ${
        isComingSoon
          ? "cursor-not-allowed border-[var(--payaptic-border)] opacity-60"
          : "border-[var(--payaptic-border)] hover:shadow-lg"
      }`}
    >
      {isComingSoon && (
        <span className="absolute right-4 top-4 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
          Coming Soon
        </span>
      )}

      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--payaptic-primary)] text-white">
        <Icon className="h-6 w-6" />
      </div>

      <h3 className="mb-2 text-lg font-semibold text-[var(--payaptic-text)]">
        {tool.name}
      </h3>

      <p className="mb-4 flex-1 text-sm text-[var(--payaptic-text-muted)]">
        {tool.description}
      </p>

      {!isComingSoon && (
        <div className="flex items-center gap-1 text-sm font-medium text-[var(--payaptic-primary)] group-hover:text-[var(--payaptic-primary-light)]">
          Open Tool
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      )}
    </Link>
  );
}
