import React from 'react';
import { AlertTriangle, CheckCircle, HelpCircle, XCircle, ShieldAlert } from 'lucide-react';

export default function RiskMeter({ overallStatus, riskLevel }) {
  const getStatusConfig = () => {
    switch (overallStatus) {
      case 'Verified':
        return {
          icon: CheckCircle,
          color: 'text-emerald-700',
          bg: 'bg-emerald-50',
          border: 'border-emerald-300',
          badgeBg: 'bg-emerald-600',
          text: 'Verified'
        };
      case 'Partially Verified':
        return {
          icon: HelpCircle,
          color: 'text-blue-700',
          bg: 'bg-blue-50',
          border: 'border-blue-300',
          badgeBg: 'bg-blue-600',
          text: 'Partially Verified'
        };
      case 'Contradicted':
        return {
          icon: XCircle,
          color: 'text-rose-700',
          bg: 'bg-rose-50',
          border: 'border-rose-300',
          badgeBg: 'bg-rose-600',
          text: 'Contradicted'
        };
      case 'Potential Risk':
      default:
        return {
          icon: AlertTriangle,
          color: 'text-amber-800',
          bg: 'bg-amber-50',
          border: 'border-amber-300',
          badgeBg: 'bg-amber-600',
          text: 'Potential Risk'
        };
    }
  };

  const getRiskColor = () => {
    switch (riskLevel?.toLowerCase()) {
      case 'high':
        return { text: 'text-rose-600', bg: 'bg-rose-100', dot: 'bg-rose-600', bar: 'w-full bg-rose-600' };
      case 'medium':
        return { text: 'text-amber-600', bg: 'bg-amber-100', dot: 'bg-amber-500', bar: 'w-2/3 bg-amber-500' };
      case 'low':
        return { text: 'text-blue-600', bg: 'bg-blue-100', dot: 'bg-blue-500', bar: 'w-1/3 bg-blue-500' };
      case 'safe':
      default:
        return { text: 'text-emerald-600', bg: 'bg-emerald-100', dot: 'bg-emerald-500', bar: 'w-1/12 bg-emerald-500' };
    }
  };

  const statusCfg = getStatusConfig();
  const riskCfg = getRiskColor();
  const StatusIcon = statusCfg.icon;

  return (
    <div className={`rounded-xl border p-5 ${statusCfg.bg} ${statusCfg.border} shadow-sm transition-all`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Overall Status */}
        <div className="flex items-start sm:items-center gap-3.5">
          <div className={`p-2.5 rounded-lg bg-white shadow-sm border border-slate-200/60 ${statusCfg.color}`}>
            <StatusIcon className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Analysis Result</span>
              <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono font-medium">LIVE</span>
            </div>
            <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${statusCfg.color} flex items-center gap-2`}>
              {statusCfg.text}
            </h2>
          </div>
        </div>

        {/* Right: Risk Level */}
        <div className="bg-white/80 backdrop-blur-sm px-4 py-3 rounded-lg border border-slate-200/80 min-w-[190px]">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Risk Assessment</span>
            <span className={`text-xs font-black uppercase px-2 py-0.5 rounded-full ${riskCfg.bg} ${riskCfg.text}`}>
              {riskLevel || 'MEDIUM'}
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${riskCfg.bar}`}></div>
          </div>
          <div className="flex justify-between text-[9px] text-slate-400 font-semibold mt-1">
            <span>Safe</span>
            <span>Moderate</span>
            <span>Critical</span>
          </div>
        </div>
      </div>
    </div>
  );
}
