import React from 'react';
import {
  Tag,
  AlertCircle,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';

export default function DisclosureBadge({ disclosure }) {
  if (!disclosure) return null;

  const status =
    disclosure.status ||
    '';

  const detected =
    disclosure.detected ||
    disclosure.disclosed ||
    status.toLowerCase().includes('disclosure detected');

  const possiblePromotion =
    status.toLowerCase().includes('possible promotional content');

  let style;

  if (detected) {
    style = {
      bg: 'bg-emerald-50 border-emerald-300',
      badge: 'bg-emerald-600 text-white',
      icon: CheckCircle2,
      title: 'Sponsorship or disclosure found'
    };
  } else if (possiblePromotion) {
    style = {
      bg: 'bg-amber-50 border-amber-300',
      badge: 'bg-amber-500 text-white',
      icon: AlertCircle,
      title: 'Possible promotional content'
    };
  } else {
    style = {
      bg: 'bg-slate-50 border-slate-300',
      badge: 'bg-slate-500 text-white',
      icon: HelpCircle,
      title: 'No sponsorship disclosure found'
    };
  }

  const Icon = style.icon;

  return (
    <div
      className={`rounded-lg border p-4 shadow-sm ${style.bg}`}
    >

      <div className="flex items-center justify-between gap-3 mb-2">

        <div className="flex items-center gap-2">

          <Tag className="w-4 h-4 text-slate-500" />

          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Sponsorship & Advertising
          </h4>

        </div>

        <span
          className={`text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${style.badge}`}
        >
          <Icon className="w-3.5 h-3.5" />

          <span>
            {detected
              ? 'Disclosure found'
              : possiblePromotion
              ? 'Possible promotion'
              : 'No disclosure found'}
          </span>
        </span>

      </div>

      <p className="text-xs leading-relaxed text-slate-600 mb-2">
        {disclosure.explanation ||
          (detected
            ? 'The content contains language indicating sponsorship, advertising, or another form of disclosure.'
            : 'We did not find a clear sponsorship or advertising disclosure in the content.')}
      </p>

      {disclosure.trigger_text && (
        <div className="text-[11px] bg-white/80 border border-slate-200 rounded px-2.5 py-1 text-slate-700 mb-2">

          <span className="font-semibold text-slate-500">
            Detected text:
          </span>

          <code className="ml-1 font-semibold text-amber-800">
            {disclosure.trigger_text}
          </code>

        </div>
      )}

      <div className="text-[11px] text-slate-500 italic border-t border-slate-200/60 pt-2 flex items-start gap-1.5">

        <AlertCircle className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />

        <span>
          Not finding a disclosure does not prove that the content is
          non-compliant or unsponsored.
        </span>

      </div>

    </div>
  );
}