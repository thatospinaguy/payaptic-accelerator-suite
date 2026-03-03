import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CalcValueDefLoader from "@/components/tools/CalcValueDefLoader";

export default function CalcValueDefLoaderPage() {
  return (
    <div>
      <Link
        href="/dashboard"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-payaptic-ocean hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-payaptic-navy">
          Calculation Value Definition Loader
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Generate dual-structure HDL files for Oracle HCM Calculation Value
          Definitions with automatic ValueDefinition and RangeItem pairing
        </p>
      </div>

      <CalcValueDefLoader />
    </div>
  );
}
