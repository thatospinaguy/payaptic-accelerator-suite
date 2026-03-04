"use client";

import Link from "next/link";
import { FileUp, Scale, Calculator, FolderTree, Languages, FileText, TextCursorInput, ShieldCheck } from "lucide-react";
import type { Tool } from "@/lib/tools-config";

const iconMap = {
  FileUp,
  Scale,
  Calculator,
  FolderTree,
  Languages,
  FileText,
  TextCursorInput,
  ShieldCheck,
} as const;

export default function ToolCard({ tool }: { tool: Tool }) {
  const Icon = iconMap[tool.icon];
  const isActive = tool.status === "active";

  const card = (
    <div
      className={`flex flex-col rounded-2xl bg-white p-6 shadow-sm ${
        isActive
          ? "cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md"
          : "cursor-not-allowed opacity-50"
      }`}
    >
      <div className="mb-4 flex items-start justify-between">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${
            isActive
              ? "bg-payaptic-emerald/10 text-payaptic-emerald"
              : "bg-gray-100 text-gray-400"
          }`}
        >
          <Icon className="h-6 w-6" />
        </div>
        {isActive ? (
          <span className="rounded-full bg-payaptic-emerald/10 px-3 py-1 text-xs font-medium text-payaptic-emerald">
            Active
          </span>
        ) : (
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500">
            Coming Soon
          </span>
        )}
      </div>

      <h3 className="mb-2 text-xl font-bold text-payaptic-navy">
        {tool.name}
      </h3>

      <p className="flex-1 text-sm leading-relaxed text-gray-500">
        {tool.description}
      </p>
    </div>
  );

  if (!isActive) return card;

  return (
    <Link href={tool.route} className="block">
      {card}
    </Link>
  );
}
