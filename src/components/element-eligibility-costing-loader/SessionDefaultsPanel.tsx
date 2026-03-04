'use client';

interface SessionDefaultsPanelProps {
  legislativeDataGroupName: string;
  setLegislativeDataGroupName: (v: string) => void;
  effectiveStartDate: string;
  setEffectiveStartDate: (v: string) => void;
  effectiveEndDate: string;
  setEffectiveEndDate: (v: string) => void;
  action: 'MERGE' | 'DELETE';
  setAction: (v: 'MERGE' | 'DELETE') => void;
}

export default function SessionDefaultsPanel({
  legislativeDataGroupName,
  setLegislativeDataGroupName,
  effectiveStartDate,
  setEffectiveStartDate,
  effectiveEndDate,
  setEffectiveEndDate,
  action,
  setAction,
}: SessionDefaultsPanelProps) {
  return (
    <div className="card p-6">
      <h2 className="text-sm font-semibold text-payaptic-ocean uppercase tracking-wider mb-4">
        Session Defaults
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Legislative Data Group
          </label>
          <input
            type="text"
            value={legislativeDataGroupName}
            onChange={(e) => setLegislativeDataGroupName(e.target.value)}
            className={`input-field w-full ${!legislativeDataGroupName.trim() ? 'border-amber-300' : ''}`}
            placeholder="e.g. Chartwell CA LDG"
          />
          {!legislativeDataGroupName.trim() && (
            <p className="text-xs text-amber-600 mt-1">
              Required — applied to all rows
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Effective Start Date
          </label>
          <input
            type="text"
            value={effectiveStartDate}
            onChange={(e) => setEffectiveStartDate(e.target.value)}
            className={`input-field w-full ${!effectiveStartDate.trim() ? 'border-amber-300' : ''}`}
            placeholder="YYYY/MM/DD"
          />
          <p className="text-xs text-gray-400 mt-1">
            Format: YYYY/MM/DD
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Effective End Date
          </label>
          <input
            type="text"
            value={effectiveEndDate}
            onChange={(e) => setEffectiveEndDate(e.target.value)}
            className="input-field w-full"
            placeholder="4712/12/31"
          />
          <p className="text-xs text-gray-400 mt-1">
            Default: 4712/12/31 (Oracle max date)
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Action
          </label>
          <select
            value={action}
            onChange={(e) => setAction(e.target.value as 'MERGE' | 'DELETE')}
            className="input-field w-full"
          >
            <option value="MERGE">MERGE</option>
            <option value="DELETE">DELETE</option>
          </select>
          <p className="text-xs text-gray-400 mt-1">
            Applies to all rows in all files
          </p>
        </div>
      </div>
    </div>
  );
}
