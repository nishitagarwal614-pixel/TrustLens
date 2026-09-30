import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function DisclaimerBanner() {
  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-900 px-4 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>
            <strong>Informational Verification & Literacy Utility:</strong> TrustLens AI does NOT provide investment advice, recommendation ratings, or stock calls.
          </span>
        </div>
        <span className="hidden sm:inline-block text-[11px] font-semibold text-amber-800 uppercase tracking-wide bg-amber-200/60 px-2 py-0.5 rounded">
          Non-Advisory Platform
        </span>
      </div>
    </div>
  );
}
