import { tools } from "@/lib/tools-config";
import ToolCard from "@/components/dashboard/ToolCard";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--payaptic-text)]">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-[var(--payaptic-text-muted)]">
          Select a tool to get started with your Oracle HCM Cloud
          implementation.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </div>
  );
}
