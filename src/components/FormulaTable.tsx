"use client";

import React from "react";
import {
  AlertCircle,
  CheckCircle,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { FormulaEntry } from "@/lib/types";

interface FormulaTableProps {
  entries: FormulaEntry[];
  onUpdateEntry: (id: string, updates: Partial<FormulaEntry>) => void;
  onRemoveEntry: (id: string) => void;
}

export default function FormulaTable({
  entries,
  onUpdateEntry,
  onRemoveEntry,
}: FormulaTableProps) {
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  if (entries.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
        No formula entries yet. Upload a report and formula files above to get
        started.
      </div>
    );
  }

  const errorCount = entries.filter((e) => e.errors.length > 0).length;
  const matchedCount = entries.filter((e) => e.matched).length;

  return (
    <div className="space-y-3">
      {/* Summary bar */}
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <span className="font-medium text-payaptic-navy">
          {entries.length} entr{entries.length !== 1 ? "ies" : "y"}
        </span>
        {matchedCount > 0 && (
          <span className="flex items-center gap-1 text-payaptic-emerald">
            <CheckCircle className="h-4 w-4" />
            {matchedCount} matched
          </span>
        )}
        {errorCount > 0 && (
          <span className="flex items-center gap-1 text-red-500">
            <AlertCircle className="h-4 w-4" />
            {errorCount} with errors
          </span>
        )}
      </div>

      {/* Entry cards */}
      {entries.map((entry) => (
        <div
          key={entry.id}
          className={`rounded-lg border bg-white ${
            entry.errors.length > 0
              ? "border-red-200"
              : entry.matched
              ? "border-payaptic-emerald/30"
              : "border-gray-200"
          }`}
        >
          {/* Header row */}
          <div className="flex items-center gap-3 px-4 py-3">
            {entry.errors.length > 0 ? (
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
            ) : (
              <CheckCircle className="h-4 w-4 shrink-0 text-payaptic-emerald" />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-payaptic-navy">
                {entry.formulaName || entry.file.fileName}
              </p>
              <p className="truncate text-xs text-gray-400">
                {entry.file.fileName}
                {!entry.matched && (
                  <span className="ml-2 text-amber-500">
                    (no report match)
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={() =>
                setExpandedId(expandedId === entry.id ? null : entry.id)
              }
              className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              title="Toggle details"
            >
              {expandedId === entry.id ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
            <button
              onClick={() => onRemoveEntry(entry.id)}
              className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
              title="Remove entry"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          {/* Errors */}
          {entry.errors.length > 0 && (
            <div className="border-t border-red-100 bg-red-50 px-4 py-2">
              {entry.errors.map((err, i) => (
                <p key={i} className="text-xs text-red-600">
                  {err}
                </p>
              ))}
            </div>
          )}

          {/* Expanded edit form */}
          {expandedId === entry.id && (
            <div className="border-t border-gray-100 px-4 py-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-500">
                    Formula Name
                  </label>
                  <input
                    type="text"
                    value={entry.formulaName}
                    onChange={(e) =>
                      onUpdateEntry(entry.id, {
                        formulaName: e.target.value,
                      })
                    }
                    className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-payaptic-ocean focus:outline-none focus:ring-1 focus:ring-payaptic-ocean"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-500">
                    Formula Type
                  </label>
                  <input
                    type="text"
                    value={entry.formulaType}
                    onChange={(e) =>
                      onUpdateEntry(entry.id, {
                        formulaType: e.target.value,
                      })
                    }
                    className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-payaptic-ocean focus:outline-none focus:ring-1 focus:ring-payaptic-ocean"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-500">
                    Effective Start Date
                  </label>
                  <input
                    type="date"
                    value={entry.effectiveStartDate}
                    onChange={(e) =>
                      onUpdateEntry(entry.id, {
                        effectiveStartDate: e.target.value,
                      })
                    }
                    className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-payaptic-ocean focus:outline-none focus:ring-1 focus:ring-payaptic-ocean"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-500">
                    Legislative Data Group
                  </label>
                  <input
                    type="text"
                    value={entry.legislativeDataGroup}
                    onChange={(e) =>
                      onUpdateEntry(entry.id, {
                        legislativeDataGroup: e.target.value,
                      })
                    }
                    className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-payaptic-ocean focus:outline-none focus:ring-1 focus:ring-payaptic-ocean"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-gray-500">
                    Description
                  </label>
                  <input
                    type="text"
                    value={entry.description}
                    onChange={(e) =>
                      onUpdateEntry(entry.id, {
                        description: e.target.value,
                      })
                    }
                    className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-payaptic-ocean focus:outline-none focus:ring-1 focus:ring-payaptic-ocean"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
