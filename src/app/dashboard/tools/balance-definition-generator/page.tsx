import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import BalanceDefinitionGenerator from "@/components/tools/BalanceDefinitionGenerator";

export default function BalanceDefinitionGeneratorPage() {
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
          Payroll Balance Definition Generator
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Generate Oracle HCM HDL BalanceFeed .dat files for payroll balance
          definitions
        </p>
      </div>

      <BalanceDefinitionGenerator />
    </div>
  );
}
