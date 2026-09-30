import React, { useState, useEffect } from 'react';
import { Users, ShieldAlert, CheckCircle2, AlertTriangle, XCircle, Tag, ExternalLink, Info, Award } from 'lucide-react';
import { fetchCreators } from '../services/api';

export default function CreatorProfilesPage({ onNavigate }) {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCreator, setSelectedCreator] = useState(null);

  useEffect(() => {
    fetchCreators()
      .then(data => {
        setCreators(data);
        if (data.length > 0) setSelectedCreator(data[0]);
      })
      .catch(err => console.error('Failed to load creators:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-16 text-center text-slate-500">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs">Loading creator transparency profiles...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Creator Transparency Profiles</h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Objective claim verification metrics and sponsorship disclosure tracking for public financial commentators.
        </p>
      </div>

      {/* Compliance Notice Banner */}
      <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-3 text-xs text-blue-900 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Transparency Principle:</strong> TrustLens AI does NOT compute arbitrary subjective "truth scores". Instead, we publish raw empirical corroboration metrics so retail investors can formulate their own independent judgment.
        </div>
      </div>

      {/* Grid of Creators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {creators.map((c) => {
          const isSelected = selectedCreator?.id === c.id;
          const m = c.metrics;

          return (
            <div
              key={c.id}
              onClick={() => setSelectedCreator(c)}
              className={`bg-white rounded-xl border p-5 shadow-sm cursor-pointer transition-all ${
                isSelected ? 'border-blue-500 ring-2 ring-blue-100 shadow-md' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Profile Card Header */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{c.name}</h3>
                  <span className="text-xs font-mono font-semibold text-blue-600">{c.handle}</span>
                  <span className="text-[11px] text-slate-400 block">{c.platform}</span>
                </div>
                {c.is_registered_verified ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" /> SEBI RA
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                    Unregistered
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                {c.bio}
              </p>

              {/* Title of Metrics */}
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 border-t border-slate-100 pt-3">
                Content Transparency Profile
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-50 p-2 rounded border border-slate-100">
                  <span className="text-slate-400 text-[10px] block">Posts Analyzed</span>
                  <span className="font-bold text-slate-800 text-sm">{m.posts_analyzed}</span>
                </div>
                <div className="bg-emerald-50/70 p-2 rounded border border-emerald-100">
                  <span className="text-emerald-700 text-[10px] block">Verified Claims</span>
                  <span className="font-bold text-emerald-800 text-sm">{m.verified_claims}</span>
                </div>
                <div className="bg-amber-50/70 p-2 rounded border border-amber-100">
                  <span className="text-amber-700 text-[10px] block">Unverified Claims</span>
                  <span className="font-bold text-amber-800 text-sm">{m.unverified_claims}</span>
                </div>
                <div className="bg-rose-50/70 p-2 rounded border border-rose-100">
                  <span className="text-rose-700 text-[10px] block">Contradicted</span>
                  <span className="font-bold text-rose-800 text-sm">{m.contradicted_claims}</span>
                </div>
              </div>

              {/* Promotional & Disclosure summary */}
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Promotional Posts: <strong className="text-slate-800">{m.promotional_posts_detected}</strong></span>
                <span>Disclosures: <strong className="text-slate-800">{m.disclosures_detected}</strong></span>
              </div>

              {/* Statutory Note */}
              <div className="mt-3 text-[10px] text-slate-500 italic bg-slate-50 p-2 rounded border border-slate-200/60">
                {c.registration_status_note}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Creator Detail Section */}
      {selectedCreator && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">{selectedCreator.name}</h2>
                <span className="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{selectedCreator.handle}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">{selectedCreator.bio}</p>
            </div>

            <button
              onClick={() => onNavigate('analyze', { preset: { content: '', creator: selectedCreator.handle } })}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm"
            >
              Analyze Post From This Creator
            </button>
          </div>

          <div className="text-xs text-slate-600 leading-relaxed">
            <h4 className="font-bold text-slate-800 mb-2">Audited Corroboration Breakdown</h4>
            <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden flex">
              <div 
                className="bg-emerald-500 h-full" 
                style={{ width: `${(selectedCreator.metrics.verified_claims / selectedCreator.metrics.posts_analyzed) * 100}%` }}
                title="Verified"
              ></div>
              <div 
                className="bg-amber-400 h-full" 
                style={{ width: `${(selectedCreator.metrics.unverified_claims / selectedCreator.metrics.posts_analyzed) * 100}%` }}
                title="Unverified"
              ></div>
              <div 
                className="bg-rose-500 h-full" 
                style={{ width: `${(selectedCreator.metrics.contradicted_claims / selectedCreator.metrics.posts_analyzed) * 100}%` }}
                title="Contradicted"
              ></div>
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 mt-1.5 font-medium">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Verified ({selectedCreator.metrics.verified_claims})</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400"></span> Unverified ({selectedCreator.metrics.unverified_claims})</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Contradicted ({selectedCreator.metrics.contradicted_claims})</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
