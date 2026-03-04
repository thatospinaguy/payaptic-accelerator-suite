import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import FastFormulaFormatter from "@/components/tools/FastFormulaFormatter";

export default function FastFormulaFormatterPage() {
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
          Fast Formula Code Formatter
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Clean up and format Oracle Fast Formula code with proper indentation,
          consistent headers, and professional code style
        </p>
      </div>

      <FastFormulaFormatter />
    </div>
  );
}
