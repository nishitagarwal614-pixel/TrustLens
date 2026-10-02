import React from 'react';
import { FileText, Calendar, Building2, CheckCircle, XCircle, HelpCircle } from 'lucide-react';

export default function EvidenceCard({ evidence }) {
  if (!evidence) return null;

  const isContradiction = evidence.status === 'Contradicts';
  const isSupport = evidence.status === 'Supports';

  return (
    <div className={`bg-white rounded-lg border p-4 shadow-sm transition-all ${
      isContradiction ? 'border-rose-300 bg-rose-50/20' : isSupport ? 'border-emerald-300 bg-emerald-50/20' : 'border-slate-200'
    }`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            <span>{evidence.source_name}</span>
          </div>
          <h4 className="text-xs text-slate-600 font-medium mt-0.5">{evidence.document_title}</h4>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {evidence.document_date && (
            <span className="flex items-center gap-1 text-[11px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
              <Calendar className="w-3 h-3" />
              <span>{evidence.document_date}</span>
            </span>
          )}

          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
            DEMO DATASET
          </span>

          <span className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
            isContradiction
              ? 'bg-rose-100 text-rose-800 border border-rose-300'
              : isSupport
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              : 'bg-slate-100 text-slate-700'
          }`}>
            {isContradiction && <XCircle className="w-3 h-3 text-rose-600" />}
            {isSupport && <CheckCircle className="w-3 h-3 text-emerald-600" />}
            <span>{evidence.status || 'Cited Document'}</span>
          </span>
        </div>
      </div>

      {/* Relevant excerpt quote */}
      <div className="bg-slate-50/80 rounded p-3 border border-slate-200/80 my-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
          Relevant Official Excerpt:
        </span>
        <p className="text-xs text-slate-700 leading-relaxed italic font-serif">
          "{evidence.excerpt}"
        </p>
      </div>

      {/* Footer details */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
        <span>Source Classification: <strong className="text-slate-700">{evidence.source_type}</strong></span>
        {evidence.relevance && (
          <span className="font-mono text-slate-600">Relevance Match: {Math.round(evidence.relevance * 100)}%</span>
        )}
      </div>
    </div>
  );
}
