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
      <h1 className="mb-6 text-2xl font-bold text-payaptic-navy">
        Fast Formula Bulk Upload
      </h1>
      <FastFormulaUpload />
    </div>
  );
}
