import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import FastFormulaUpload from "@/components/tools/FastFormulaUpload";

export default function FastFormulaUploadPage() {
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
          Fast Formula Bulk Upload
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Package Oracle HCM Fast Formula files for bulk upload via Data
          Exchange
        </p>
      </div>

      <FastFormulaUpload />
    </div>
  );
}
