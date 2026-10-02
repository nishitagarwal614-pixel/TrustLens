import React from 'react';
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  Tag,
  ShieldCheck
} from 'lucide-react';

export default function ClaimCard({ claim }) {
  if (!claim) return null;

  const getBadgeStyle = (status) => {
    switch (status) {
      case 'Verified':
        return {
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          icon: CheckCircle2,
          label: 'Confirmed',
          explanation: 'Reliable sources support this claim.'
        };

      case 'Contradicted':
        return {
          bg: 'bg-rose-100 text-rose-800 border-rose-300',
          icon: XCircle,
          label: 'Conflicts with sources',
          explanation: 'Reliable sources contain information that conflicts with this claim.'
        };

      case 'Partially Verified':
        return {
          bg: 'bg-blue-100 text-blue-800 border-blue-300',
          icon: ShieldCheck,
          label: 'Partly supported',
          explanation: 'Some parts of this claim are supported, but others could not be confirmed.'
        };

      default:
        return {
          bg: 'bg-amber-100 text-amber-800 border-amber-300',
          icon: AlertCircle,
          label: 'Could not verify',
          explanation: 'We could not find enough reliable evidence to confirm or contradict this claim.'
        };
    }
  };

  const badge = getBadgeStyle(claim.status);
  const BadgeIcon = badge.icon;

  const claimText =
    claim.claim ||
    claim.text ||
    '';

  const claimType =
    claim.claim_type ||
    claim.type ||
    'Factual information';

  const explanation =
    claim.explanation ||
    claim.verification_explanation ||
    badge.explanation;

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm hover:border-slate-300 transition-all">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">

        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">

          <Tag className="w-3.5 h-3.5 text-slate-400" />

          <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-semibold text-slate-700">
            {claimType}
          </span>

        </div>

        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${badge.bg}`}
        >
          <BadgeIcon className="w-3.5 h-3.5 flex-shrink-0" />

          <span>
            {badge.label}
          </span>
        </span>

      </div>

      {/* CLAIM */}
      <blockquote className="text-sm font-semibold text-slate-800 border-l-2 border-slate-300 pl-3 my-3 italic leading-relaxed">
        "{claimText}"
      </blockquote>

      {/* SIMPLE EXPLANATION */}
      <div className="mt-3 bg-slate-50 rounded-lg border border-slate-100 p-3">

        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
          What this means
        </p>

        <p className="text-xs text-slate-600 leading-relaxed">
          {explanation}
        </p>

      </div>

      {/* CONFIDENCE */}
      {claim.confidence != null && (
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 mt-3 border-t border-slate-100">

          <span>
            Confidence in this assessment
          </span>

          <span className="font-semibold text-slate-700">
            {Math.round(claim.confidence * 100)}%
          </span>

        </div>
      )}

    </div>
  );
}