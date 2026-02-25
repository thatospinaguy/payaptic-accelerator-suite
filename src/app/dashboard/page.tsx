"use client";

import { useUser } from "@clerk/nextjs";
import { tools } from "@/lib/tools-config";
import ToolCard from "@/components/dashboard/ToolCard";

export default function DashboardPage() {
  const { user } = useUser();

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div>
      {/* Welcome section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-payaptic-navy">
          Welcome back, {user?.firstName || "there"}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Payaptic Oracle Accelerator Suite
        </p>
        <p className="mt-0.5 text-sm text-gray-400">{today}</p>
      </div>

      {/* Tool cards grid */}
      <div className="grid gap-6 sm:grid-cols-2">
        {tools.map((tool) => (
          <ToolCard key={tool.slug} tool={tool} />
        ))}
      </div>
    </div>
  );
}
