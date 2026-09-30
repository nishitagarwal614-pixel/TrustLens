import React, { useState, useEffect } from 'react';
import { Search, Flag, BookOpen, Tag, CheckCircle2 } from 'lucide-react';

const STEPS = [
  { id: 1, text: "Extracting claims...", icon: Search },
  { id: 2, text: "Checking red flags...", icon: Flag },
  { id: 3, text: "Searching available evidence...", icon: BookOpen },
  { id: 4, text: "Analyzing disclosures...", icon: Tag },
];

export default function AnalysisLoading() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 450);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm text-center max-w-lg mx-auto">
      {/* Animated radar / shield */}
      <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping"></div>
        <div className="absolute inset-2 rounded-full bg-blue-500/30 animate-pulse"></div>
        <div className="relative z-10 w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg">
          <Search className="w-6 h-6 animate-pulse" />
        </div>
      </div>

      <h3 className="text-base font-bold text-slate-900 mb-1">Analyzing Financial Content</h3>
      <p className="text-xs text-slate-500 mb-6">Cross-referencing against verified exchange filings and regulatory directives...</p>

      {/* Steps list */}
      <div className="space-y-3 text-left max-w-xs mx-auto">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div
              key={step.id}
              className={`flex items-center gap-3 p-2.5 rounded-lg border text-xs transition-all ${
                isDone
                  ? 'bg-emerald-50/60 border-emerald-200 text-emerald-800'
                  : isCurrent
                  ? 'bg-blue-50/80 border-blue-300 text-blue-900 font-semibold shadow-sm scale-102'
                  : 'bg-slate-50/50 border-slate-100 text-slate-400'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              ) : (
                <Icon className={`w-4 h-4 flex-shrink-0 ${isCurrent ? 'text-blue-600 animate-spin' : 'text-slate-400'}`} />
              )}
              <span>{step.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
