import React from 'react';
import {
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  XCircle
} from 'lucide-react';

export default function RiskMeter({
  overallStatus,
  riskLevel
}) {
  const getStatusConfig = () => {
    switch (overallStatus) {
      case 'Verified':
        return {
          icon: CheckCircle,
          color: 'text-emerald-700',
          bg: 'bg-emerald-50',
          border: 'border-emerald-300',
          text: 'Information supported',
          description:
            'Reliable sources support the main claims we checked.'
        };

      case 'Partially Verified':
        return {
          icon: HelpCircle,
          color: 'text-blue-700',
          bg: 'bg-blue-50',
          border: 'border-blue-300',
          text: 'Partly supported',
          description:
            'Some parts of the information are supported, but not everything could be confirmed.'
        };

      case 'Contradicted':
        return {
          icon: XCircle,
          color: 'text-rose-700',
          bg: 'bg-rose-50',
          border: 'border-rose-300',
          text: 'Conflicts with reliable sources',
          description:
            'Reliable sources contain information that conflicts with one or more claims.'
        };

      case 'Unverified':
      case 'Unverifiable':
        return {
          icon: HelpCircle,
          color: 'text-amber-800',
          bg: 'bg-amber-50',
          border: 'border-amber-300',
          text: 'Needs more evidence',
          description:
            'We could not find enough reliable evidence to confirm or contradict the information.'
        };

      case 'Potential Risk':
      default:
        return {
          icon: AlertTriangle,
          color: 'text-amber-800',
          bg: 'bg-amber-50',
          border: 'border-amber-300',
          text: 'Needs more evidence',
          description:
            'Some information could not be fully verified. Check the original sources before relying on it.'
        };
    }
  };

  const getRiskConfig = () => {
    switch (riskLevel?.toLowerCase()) {
      case 'high':
        return {
          text: 'High',
          textColor: 'text-rose-600',
          bg: 'bg-rose-100',
          bar: 'w-full bg-rose-600'
        };

      case 'medium':
        return {
          text: 'Medium',
          textColor: 'text-amber-600',
          bg: 'bg-amber-100',
          bar: 'w-2/3 bg-amber-500'
        };

      case 'low':
        return {
          text: 'Low',
          textColor: 'text-blue-600',
          bg: 'bg-blue-100',
          bar: 'w-1/3 bg-blue-500'
        };

      case 'safe':
        return {
          text: 'Low',
          textColor: 'text-emerald-600',
          bg: 'bg-emerald-100',
          bar: 'w-1/12 bg-emerald-500'
        };

      default:
        return {
          text: 'Medium',
          textColor: 'text-amber-600',
          bg: 'bg-amber-100',
          bar: 'w-2/3 bg-amber-500'
        };
    }
  };

  const statusConfig = getStatusConfig();
  const riskConfig = getRiskConfig();

  const StatusIcon = statusConfig.icon;

  return (
    <div
      className={`rounded-xl border p-5 ${statusConfig.bg} ${statusConfig.border} shadow-sm transition-all`}
    >

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        {/* RESULT */}
        <div className="flex items-start sm:items-center gap-3.5">

          <div
            className={`p-2.5 rounded-lg bg-white shadow-sm border border-slate-200/60 ${statusConfig.color}`}
          >
            <StatusIcon className="w-7 h-7" />
          </div>

          <div>

            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Verification Result
            </span>

            <h2
              className={`text-xl sm:text-2xl font-black tracking-tight ${statusConfig.color}`}
            >
              {statusConfig.text}
            </h2>

            <p className="text-xs text-slate-600 mt-1 max-w-xl leading-relaxed">
              {statusConfig.description}
            </p>

          </div>
        </div>

        {/* RISK */}
        <div className="bg-white/80 backdrop-blur-sm px-4 py-3 rounded-lg border border-slate-200/80 min-w-[190px]">

          <div className="flex justify-between items-center mb-1.5">

            <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">
              Risk level
            </span>

            <span
              className={`text-xs font-black uppercase px-2 py-0.5 rounded-full ${riskConfig.bg} ${riskConfig.textColor}`}
            >
              {riskConfig.text}
            </span>

          </div>

          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">

            <div
              className={`h-full rounded-full transition-all duration-500 ${riskConfig.bar}`}
            />

          </div>

          <div className="flex justify-between text-[9px] text-slate-400 font-semibold mt-1">
            <span>Lower</span>
            <span>Moderate</span>
            <span>Higher</span>
          </div>

        </div>

      </div>
    </div>
  );
}