'use client';

import { exportAsZip } from '@/lib/hdl-common/file-export';
import { GeneratedFiles } from '@/lib/element-eligibility-costing-loader/types';
import {
  ELIGIBILITY_DAT_FILENAME,
  COST_INFO_DAT_FILENAME,
  COST_ALLOCATION_DAT_FILENAME,
  COST_ALLOCATION_ACCOUNT_DAT_FILENAME,
  ZIP_FILENAME,
} from '@/lib/element-eligibility-costing-loader/constants';

interface ExportButtonProps {
  generatedFiles: GeneratedFiles;
  totalRows: number;
}

export default function ExportButton({ generatedFiles, totalRows }: ExportButtonProps) {
  async function handleDownloadZip() {
    await exportAsZip(
      [
        { name: ELIGIBILITY_DAT_FILENAME, content: generatedFiles.eligibilityDat },
        { name: COST_INFO_DAT_FILENAME, content: generatedFiles.costInfoDat },
        { name: COST_ALLOCATION_DAT_FILENAME, content: generatedFiles.costAllocationDat },
        { name: COST_ALLOCATION_ACCOUNT_DAT_FILENAME, content: generatedFiles.costAllocationAccountDat },
      ],
      ZIP_FILENAME
    );
  }

  return (
    <div className="card p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
        <h2 className="text-sm font-semibold text-payaptic-ocean uppercase tracking-wider">
          Export
        </h2>
        <span className="text-sm text-gray-500">
          {totalRows} total row{totalRows !== 1 ? 's' : ''} across 4 files
        </span>
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleDownloadZip}
          disabled={totalRows === 0}
          className="btn-primary text-sm"
        >
          Download .zip
        </button>
      </div>
      <p className="text-xs text-gray-400 mt-3">
        ZIP contains 4 files: {ELIGIBILITY_DAT_FILENAME}, {COST_INFO_DAT_FILENAME}, {COST_ALLOCATION_DAT_FILENAME}, {COST_ALLOCATION_ACCOUNT_DAT_FILENAME} — ready for Oracle HCM HSDL import
      </p>
    </div>
  );
}
