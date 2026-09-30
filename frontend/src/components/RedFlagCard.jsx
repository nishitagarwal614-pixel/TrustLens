import React from 'react';
import { AlertOctagon, Flame, Clock, HeartCrack, Gift } from 'lucide-react';

export default function RedFlagCard({ flag }) {
  const getSeverityStyle = (sev) => {
    switch (sev?.toLowerCase()) {
      case 'high':
        return {
          bg: 'bg-rose-50 border-rose-200',
          badge: 'bg-rose-600 text-white',
          border: 'border-l-rose-500',
          icon: AlertOctagon,
          iconColor: 'text-rose-600'
        };
      case 'medium':
        return {
          bg: 'bg-amber-50 border-amber-200',
          badge: 'bg-amber-500 text-white',
          border: 'border-l-amber-500',
          icon: Flame,
          iconColor: 'text-amber-600'
        };
      case 'low':
      default:
        return {
          bg: 'bg-blue-50 border-blue-200',
          badge: 'bg-blue-600 text-white',
          border: 'border-l-blue-500',
          icon: Clock,
          iconColor: 'text-blue-600'
        };
    }
  };

  const sevStyle = getSeverityStyle(flag.severity);
  const FlagIcon = sevStyle.icon;

  return (
    <div className={`rounded-lg border border-l-4 ${sevStyle.border} ${sevStyle.bg} p-4 shadow-sm`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <FlagIcon className={`w-4 h-4 ${sevStyle.iconColor}`} />
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
            {flag.type}
          </h4>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${sevStyle.badge}`}>
          {flag.severity} Severity
        </span>
      </div>

      <p className="text-xs text-slate-700 leading-relaxed mb-2.5">
        {flag.explanation}
      </p>

      {flag.trigger_text && (
        <div className="bg-white/80 border border-slate-200/80 rounded px-2.5 py-1.5 text-[11px] flex items-center gap-1.5 text-slate-700">
          <span className="font-semibold text-slate-400">Trigger phrase:</span>
          <code className="text-rose-700 font-mono font-semibold bg-rose-50 px-1 rounded">
            "{flag.trigger_text}"
          </code>
        </div>
      )}
    </div>
  );
}
