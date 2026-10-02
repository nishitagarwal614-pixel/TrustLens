import React from 'react';
import {
  AlertOctagon,
  Flame,
  Clock
} from 'lucide-react';

export default function RedFlagCard({ flag }) {
  if (!flag) return null;

  const getSeverityStyle = (severity) => {
    switch (severity?.toLowerCase()) {
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

  const flagName =
    flag.flag ||
    flag.type ||
    'Potential warning sign';

  const explanation =
    flag.explanation ||
    'A potential warning sign was detected in the content.';

  return (
    <div
      className={`rounded-lg border border-l-4 ${sevStyle.border} ${sevStyle.bg} p-4 shadow-sm`}
    >

      <div className="flex items-center justify-between gap-2 mb-2">

        <div className="flex items-center gap-2">

          <FlagIcon
            className={`w-4 h-4 ${sevStyle.iconColor}`}
          />

          <h4 className="text-xs font-bold text-slate-900">
            {flagName}
          </h4>

        </div>

        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${sevStyle.badge}`}
        >
          {flag.severity || 'Medium'}
        </span>

      </div>

      <p className="text-xs text-slate-700 leading-relaxed">
        {explanation}
      </p>

      {flag.trigger_text && (
        <div className="mt-2 bg-white/80 border border-slate-200 rounded px-2.5 py-1.5 text-[11px] text-slate-700">

          <span className="font-semibold text-slate-400">
            Detected phrase:
          </span>

          <code className="ml-1 text-rose-700 font-semibold">
            "{flag.trigger_text}"
          </code>

        </div>
      )}

    </div>
  );
}