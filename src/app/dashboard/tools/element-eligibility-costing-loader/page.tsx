import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ElementEligibilityCostingLoader from "@/components/tools/ElementEligibilityCostingLoader";

export default function ElementEligibilityCostingLoaderPage() {
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
          Element Eligibility &amp; Costing Loader
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Generate multi-file HDL packages for Oracle HCM element eligibility
          records and GL costing allocations
        </p>
      </div>

      <ElementEligibilityCostingLoader />
    </div>
  );
}
