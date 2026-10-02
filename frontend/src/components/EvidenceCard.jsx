import React from 'react';
import {
  Building2,
  CheckCircle,
  XCircle,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

export default function EvidenceCard({ evidence }) {
  if (!evidence) return null;

  const isContradiction =
    evidence.status === 'Contradicts';

  const isSupport =
    evidence.status === 'Supports';

  const title =
    evidence.title ||
    evidence.document_title ||
    'Source';

  const snippet =
    evidence.snippet ||
    evidence.excerpt ||
    'No excerpt was available from this source.';

  const sourceName =
    evidence.source_name ||
    'Web source';

  const sourceType =
    evidence.source_type ||
    'Web source';

  return (
    <div
      className={`bg-white rounded-lg border p-4 shadow-sm transition-all ${
        isContradiction
          ? 'border-rose-300 bg-rose-50/20'
          : isSupport
          ? 'border-emerald-300 bg-emerald-50/20'
          : 'border-slate-200'
      }`}
    >

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3 pb-3 border-b border-slate-100">

        <div className="min-w-0">

          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <Building2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />

            <span className="truncate">
              {sourceName}
            </span>
          </div>

          <h4 className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
            {title}
          </h4>

        </div>

        <div className="flex items-center gap-1.5 flex-wrap">

          <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-1 rounded">
            {sourceType}
          </span>

          <span
            className={`text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 ${
              isContradiction
                ? 'bg-rose-100 text-rose-800 border border-rose-300'
                : isSupport
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            {isContradiction && (
              <XCircle className="w-3 h-3" />
            )}

            {isSupport && (
              <CheckCircle className="w-3 h-3" />
            )}

            {!isContradiction && !isSupport && (
              <HelpCircle className="w-3 h-3" />
            )}

            <span>
              {isContradiction
                ? 'Conflicts with claim'
                : isSupport
                ? 'Supports claim'
                : 'Reference source'}
            </span>
          </span>

        </div>
      </div>

      {/* SOURCE EXPLANATION */}
      <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 my-2">

        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
          What the source says
        </span>

        <p className="text-xs text-slate-700 leading-relaxed">
          {snippet}
        </p>

      </div>

      {/* FOOTER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-[11px] text-slate-500 pt-2">

        <span>
          Source:
          <strong className="text-slate-700 ml-1">
            {sourceName}
          </strong>
        </span>

        {evidence.source_url && (
          <a
            href={evidence.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold"
          >
            View original source
            <ExternalLink className="w-3 h-3" />
          </a>
        )}

      </div>

    </div>
  );
}