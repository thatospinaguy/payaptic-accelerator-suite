import { DollarSign } from "lucide-react";

export default function CostingLoadGeneratorPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
        <DollarSign className="h-8 w-8 text-slate-400" />
      </div>
      <h1 className="mb-2 text-xl font-semibold text-[var(--payaptic-text)]">
        Costing Load Generator
      </h1>
      <p className="text-sm text-[var(--payaptic-text-muted)]">
        This tool is coming soon.
      </p>
    </div>
  );
}
