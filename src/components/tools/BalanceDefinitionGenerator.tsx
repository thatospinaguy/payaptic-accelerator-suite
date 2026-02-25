"use client";

import { Calculator } from "lucide-react";

export default function BalanceDefinitionGenerator() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--payaptic-text)]">
          Payroll Balance Definition Generator
        </h1>
        <p className="mt-1 text-sm text-[var(--payaptic-text-muted)]">
          Generate balance definitions for Oracle HCM Payroll.
        </p>
      </div>

      <div className="rounded-xl border border-[var(--payaptic-border)] bg-[var(--payaptic-surface)] p-8">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--payaptic-primary)]/10">
            <Calculator className="h-7 w-7 text-[var(--payaptic-primary)]" />
          </div>
          <p className="text-lg font-medium text-[var(--payaptic-text)]">
            Payroll Balance Definition Generator — Ready for integration
          </p>
          <p className="mt-2 text-sm text-[var(--payaptic-text-muted)]">
            Tool implementation will be added in Phase 4.
          </p>
        </div>
      </div>
    </div>
  );
}
