"use client";

import React from "react";
import { SessionDefaults } from "@/lib/types";

interface DefaultsPanelProps {
  defaults: SessionDefaults;
  onChange: (defaults: SessionDefaults) => void;
}

export default function DefaultsPanel({
  defaults,
  onChange,
}: DefaultsPanelProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="zipFileName"
            className="mb-1 block text-sm font-medium text-payaptic-navy"
          >
            Zip File Name
          </label>
          <input
            id="zipFileName"
            type="text"
            value={defaults.zipFileName}
            onChange={(e) =>
              onChange({ ...defaults, zipFileName: e.target.value })
            }
            placeholder="FastFormulaUpload"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-payaptic-ocean focus:outline-none focus:ring-1 focus:ring-payaptic-ocean"
          />
          <p className="mt-1 text-xs text-gray-400">
            Name of the generated .zip file (without extension)
          </p>
        </div>
        <div>
          <label
            htmlFor="overrideDate"
            className="mb-1 block text-sm font-medium text-payaptic-navy"
          >
            Override Effective Start Date
          </label>
          <input
            id="overrideDate"
            type="date"
            value={defaults.overrideEffectiveStartDate}
            onChange={(e) =>
              onChange({
                ...defaults,
                overrideEffectiveStartDate: e.target.value,
              })
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-payaptic-ocean focus:outline-none focus:ring-1 focus:ring-payaptic-ocean"
          />
          <p className="mt-1 text-xs text-gray-400">
            Leave blank to use dates from the report. Set a date to override all
            entries.
          </p>
        </div>
      </div>
    </div>
  );
}
