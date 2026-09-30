import React from 'react';
import { Shield, Search, Flag, Award, AlertTriangle, ArrowRight, Zap, CheckCircle2, FileText, ChevronRight } from 'lucide-react';
import { WORKFLOW_STEPS, DEMO_PRESETS } from '../data/demoData';

export default function LandingPage({ onNavigate, onTriggerDemo }) {
  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto px-4 pt-6 pb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold mb-6">
          <Shield className="w-3.5 h-3.5 text-blue-600" />
          <span>Next-Generation Retail Investor Defense Platform</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight">
          TrustLens AI
        </h1>
        
        <p className="mt-3 text-2xl sm:text-3xl font-extrabold text-blue-600 tracking-tight">
          "Verify before you trust."
        </p>

        <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          AI-powered financial content verification and retail investor protection.
          Scan posts, articles, and advice for unverified return guarantees, manipulative urgency, and conflicts with official exchange filings.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
          <button
            onClick={() => onNavigate('analyze')}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-md transition-all hover:scale-105 active:scale-95"
          >
            <Search className="w-4 h-4 text-blue-400" />
            <span>Analyze Content</span>
          </button>

          <button
            onClick={() => onNavigate('simulator')}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-semibold text-sm transition-all"
          >
            <Award className="w-4 h-4" />
            <span>Try Simulator</span>
          </button>

          <button
            onClick={onTriggerDemo}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md transition-all hover:scale-105 active:scale-95"
          >
            <Zap className="w-4 h-4 fill-current text-emerald-200" />
            <span>Try a Demo Analysis</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <p className="mt-4 text-xs text-slate-400">
          Instant execution • Includes offline demo dataset • Zero API key required
        </p>
      </section>

      {/* Feature Cards Section */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600">Core Capabilities</h2>
          <p className="text-2xl font-bold text-slate-900 mt-1">Built to Protect Retail Capital</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all group">
            <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">1. Verify Claims</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Cross-references performance metrics, revenue growth, and company numbers against official stock exchange (NSE/BSE) filings and central bank directives.
            </p>
            <div className="text-[11px] font-semibold text-blue-600 flex items-center gap-1">
              <span>Audited primary evidence</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all group">
            <div className="w-12 h-12 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Flag className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">2. Detect Red Flags</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Identifies guaranteed-return traps, artificial scarcity ("only 10 spots!"), aggressive FOMO triggers, and undisclosed referral discount funnels.
            </p>
            <div className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
              <span>Multi-layer risk indicators</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all group">
            <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">3. Learn Before You Act</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Interactive "Spot the Red Flag" gamified simulator trains investors on real-world deceptive scenarios with badges, points, and statutory guidance.
            </p>
            <div className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
              <span>Gamified financial literacy</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </section>

      {/* Simple Workflow Section */}
      <section className="max-w-6xl mx-auto px-4 bg-slate-900 rounded-2xl text-white p-8 sm:p-12 shadow-xl">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400">System Pipeline</span>
          <h2 className="text-2xl sm:text-3xl font-bold mt-1 text-white">How TrustLens AI Verifies Financial Content</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            A transparent five-stage audit architecture designed for absolute objectivity.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {WORKFLOW_STEPS.map((s, idx) => (
            <div key={idx} className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 flex flex-col justify-between hover:border-blue-500/50 transition-all">
              <div>
                <span className="text-xs font-mono font-bold text-blue-400">{s.step}</span>
                <h4 className="text-base font-bold text-white mt-1 mb-1.5">{s.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-end text-slate-500">
                <ChevronRight className="w-4 h-4 text-blue-400" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Demo Previews */}
      <section className="max-w-5xl mx-auto px-4 pb-8">
        <div className="text-center mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Quick Test Cases</span>
          <h3 className="text-xl font-bold text-slate-900 mt-1">Ready-to-Test Scenarios</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {DEMO_PRESETS.slice(0, 3).map((item) => (
            <div
              key={item.id}
              onClick={() => onNavigate('analyze', { preset: item })}
              className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm hover:border-blue-400 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    item.category === 'High Risk' ? 'bg-rose-100 text-rose-700' :
                    item.category === 'Promotional' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {item.label}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">{item.creator}</span>
                </div>
                <p className="text-xs text-slate-700 line-clamp-3 italic mb-3">
                  "{item.content}"
                </p>
              </div>
              <div className="text-[11px] font-semibold text-blue-600 flex items-center gap-1 pt-2 border-t border-slate-100">
                <span>Analyze this example</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
