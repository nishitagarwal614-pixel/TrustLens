import React from 'react';
import { CheckCircle2, AlertCircle, XCircle, Tag, ShieldCheck } from 'lucide-react';

export default function ClaimCard({ claim }) {
  const getBadgeStyle = (status) => {
    switch (status) {
      case 'Verified':
        return {
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          dot: 'bg-emerald-500',
          icon: CheckCircle2,
          label: 'Verified'
        };
      case 'Contradicted':
        return {
          bg: 'bg-rose-100 text-rose-800 border-rose-300',
          dot: 'bg-rose-500',
          icon: XCircle,
          label: 'Contradicted'
        };
      case 'Partially Verified':
        return {
          bg: 'bg-amber-100 text-amber-900 border-amber-300',
          dot: 'bg-amber-500',
          icon: ShieldCheck,
          label: 'Partially Verified'
        };
      case 'Unverified':
      default:
        return {
          bg: 'bg-blue-50 text-blue-800 border-blue-200',
          dot: 'bg-blue-600',
          icon: AlertCircle,
          label: 'Unverified'
        };
    }
  };

  const badge = getBadgeStyle(claim.status);
  const BadgeIcon = badge.icon;
  const confPct = Math.round((claim.confidence || 0.85) * 100);

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm hover:border-slate-300 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2.5">
        {/* Claim type tag */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <Tag className="w-3.5 h-3.5 text-slate-400" />
          <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-semibold text-slate-700">
            {claim.type || 'Factual Assertion'}
          </span>
        </div>

        {/* Status Badge */}
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${badge.bg}`}>
          <BadgeIcon className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{badge.label}</span>
        </span>
      </div>

      {/* Claim statement */}
      <blockquote className="text-sm font-semibold text-slate-800 border-l-2 border-slate-300 pl-3 my-2.5 italic">
        "{claim.text}"
      </blockquote>

      {/* Confidence metric */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
        <span>Extraction Confidence</span>
        <div className="flex items-center gap-2">
          <div className="w-20 bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div className="bg-blue-600 h-full rounded-full" style={{ width: `${confPct}%` }}></div>
          </div>
          <span className="font-mono font-semibold text-slate-700">{confPct}%</span>
        </div>
      </div>
    </div>
  );
}
