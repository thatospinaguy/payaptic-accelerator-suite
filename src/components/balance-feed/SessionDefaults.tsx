'use client';

import { Action } from '@/lib/balance-feed/types';
import { DEFAULT_EFFECTIVE_START_DATE } from '@/lib/balance-feed/constants';

interface SessionDefaultsProps {
  legislativeDataGroup: string;
  setLegislativeDataGroup: (v: string) => void;
  effectiveStartDate: string;
  setEffectiveStartDate: (v: string) => void;
  clientEngagement: string;
  setClientEngagement: (v: string) => void;
  sessionAction: Action;
  setSessionAction: (v: Action) => void;
}

export default function SessionDefaults({
  legislativeDataGroup,
  setLegislativeDataGroup,
  effectiveStartDate,
  setEffectiveStartDate,
  clientEngagement,
  setClientEngagement,
  sessionAction,
  setSessionAction,
}: SessionDefaultsProps) {
  const isNonStandardDate = effectiveStartDate !== DEFAULT_EFFECTIVE_START_DATE;

  return (
    <div className="card p-6">
      <h2 className="text-sm font-semibold text-payaptic-ocean uppercase tracking-wider mb-4">
        Session Defaults
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Action
          </label>
          <select
            value={sessionAction}
            onChange={(e) => setSessionAction(e.target.value as Action)}
            className="input-field w-full"
          >
            <option value="MERGE">MERGE</option>
            <option value="DELETE">DELETE</option>
          </select>
          <p className="text-xs text-gray-400 mt-1">
            Applies to all rows in this file
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Legislative Data Group
          </label>
          <input
            type="text"
            value={legislativeDataGroup}
            onChange={(e) => setLegislativeDataGroup(e.target.value)}
            className="input-field w-full"
            placeholder="e.g. US Legislative Data Group"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Effective Start Date
          </label>
          <div className="relative">
            <input
              type="text"
              value={effectiveStartDate}
              onChange={(e) => setEffectiveStartDate(e.target.value)}
              className={`input-field w-full ${isNonStandardDate ? 'border-amber-400 bg-amber-50' : ''}`}
              placeholder="YYYY/MM/DD"
            />
            {isNonStandardDate && (
              <div className="mt-1 text-xs text-amber-600">
                Heads up: Usually {DEFAULT_EFFECTIVE_START_DATE} for new implementations. Only change if the client is live.
              </div>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Client / Engagement
          </label>
          <input
            type="text"
            value={clientEngagement}
            onChange={(e) => setClientEngagement(e.target.value)}
            className="input-field w-full"
            placeholder="e.g. Acme Corp — Phase 2"
          />
        </div>
      </div>
    </div>
  );
}
