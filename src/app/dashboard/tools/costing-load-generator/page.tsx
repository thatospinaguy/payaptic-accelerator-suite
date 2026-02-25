import Link from "next/link";
import { ArrowLeft, Calculator } from "lucide-react";

export default function CostingLoadGeneratorPage() {
  return (
    <div>
      <Link
        href="/dashboard"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-payaptic-ocean hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <div className="mt-8 flex flex-col items-center justify-center rounded-2xl bg-white p-16 shadow-sm">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
          <Calculator className="h-8 w-8 text-gray-400" />
        </div>
        <h1 className="mb-2 text-xl font-bold text-payaptic-navy">
          Costing Load Generator
        </h1>
        <p className="mb-4 max-w-md text-center text-sm leading-relaxed text-gray-500">
          Generate Oracle HCM costing allocation data loads. Configure cost
          centers, account segments, and distribution rules.
        </p>
        <span className="rounded-full bg-gray-100 px-4 py-1.5 text-sm font-medium text-gray-500">
          This tool is currently in development
        </span>
      </div>
    </div>
  );
}
