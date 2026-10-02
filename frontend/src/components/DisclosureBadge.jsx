import React from 'react';
import { Tag, AlertCircle, CheckCircle2, HelpCircle } from 'lucide-react';

export default function DisclosureBadge({ disclosure }) {
  if (!disclosure) return null;

  const getStyle = () => {
    const status = disclosure.status || '';
    if (status.includes('Disclosure detected') || disclosure.detected) {
      return {
        bg: 'bg-emerald-50 border-emerald-300 text-emerald-800',
        badge: 'bg-emerald-600 text-white',
        icon: CheckCircle2,
        title: 'Disclosure Detected'
      };
    } else if (status.includes('Possible promotional content')) {
      return {
        bg: 'bg-amber-50 border-amber-300 text-amber-800',
        badge: 'bg-amber-500 text-white',
        icon: AlertCircle,
        title: 'Possible Promotional Content'
      };
    } else {
      return {
        bg: 'bg-slate-50 border-slate-300 text-slate-700',
        badge: 'bg-slate-500 text-white',
        icon: HelpCircle,
        title: 'No Disclosure Detected'
      };
    }
  };

  const style = getStyle();
  const Icon = style.icon;

  return (
    <div className={`rounded-lg border p-4 shadow-sm ${style.bg}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-slate-500" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Sponsorship & Disclosure Analysis
          </h4>
        </div>
        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${style.badge}`}>
          <Icon className="w-3.5 h-3.5" />
          <span>{disclosure.status || style.title}</span>
        </span>
      </div>

      <p className="text-xs leading-relaxed text-slate-600 mb-2">
        {disclosure.explanation}
      </p>

      {disclosure.trigger_text && (
        <div className="text-[11px] bg-white/80 border border-slate-200 rounded px-2.5 py-1 text-slate-700 mb-2">
          <span className="font-semibold text-slate-500">Commercial trigger:</span>{' '}
          <code className="font-mono text-amber-800 font-semibold">{disclosure.trigger_text}</code>
        </div>
      )}

      {/* Mandatory Regulatory Warning Note */}
      <div className="text-[11px] text-slate-500 italic border-t border-slate-200/60 pt-2 flex items-center gap-1.5">
        <AlertCircle className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
        <span>Important: "No disclosure detected" must NOT be interpreted as proof of regulatory non-compliance.</span>
      </div>
    </div>
  );
}
