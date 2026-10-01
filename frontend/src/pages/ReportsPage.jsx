import React, { useState, useEffect } from 'react';
import { AlertOctagon, CheckCircle2, ExternalLink, ShieldAlert, FileText, Send, Plus } from 'lucide-react';
import { submitReport, fetchReports } from '../services/api';

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [contentUrl, setContentUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [error, setError] = useState('');

  const loadReports = () => {
    fetchReports()
      .then(data => setReports(data))
      .catch(err => console.error('Failed to load reports:', err));
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contentUrl.trim()) {
      setError('Please provide a content URL to report.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await submitReport({
        content_url: contentUrl.trim(),
        creator_name: '',
        reason: 'Reported Content URL',
        description: `Community report for content URL: ${contentUrl.trim()}`,
        detected_claim: ''
      });
      setSubmissionResult(res);
      loadReports();
      setContentUrl('');
    } catch (err) {
      setError(err.message || 'Error recording report. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 py-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2">
          <AlertOctagon className="w-5 h-5 text-rose-600" />
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Submit Community Intelligence Report</h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Crowdsourced vigilance platform for flagging predatory pump schemes, unverified return promises, and undisclosed promotions.
        </p>
      </div>

      {/* Statutory Guidance Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 space-y-2">
        <div className="flex items-center gap-2 font-bold text-amber-950">
          <ShieldAlert className="w-4 h-4 text-amber-700 flex-shrink-0" />
          <span>Statutory Regulatory Reporting Notice</span>
        </div>
        <p className="text-amber-800 leading-relaxed text-[11px]">
          TrustLens AI records reports for collective investor awareness and algorithmic audit weighting. Unless explicitly confirmed, <strong>this application does NOT directly transmit reports to SEBI or statutory law enforcement</strong>. For statutory legal redressal, please utilize the official portals listed below.
        </p>
      </div>

      {/* Submission Success Alert */}
      {submissionResult && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-5 text-xs text-emerald-950 space-y-3">
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Your report has been recorded.</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-white border border-emerald-200 font-mono font-bold px-3 py-1 rounded text-emerald-900 text-xs">
              Report ID: {submissionResult.id}
            </span>
            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[11px] font-semibold">
              Status: {submissionResult.status}
            </span>
          </div>

          <div className="bg-white/80 p-3 rounded-lg border border-emerald-200/80 text-[11px] text-slate-700 space-y-1.5">
            <strong>Official Redressal Recommendations:</strong>
            <p>If you suffered financial loss from this creator, lodge an official complaint on the official SEBI SCORES portal (<a href="https://scores.sebi.gov.in" target="_blank" rel="noreferrer" className="text-blue-600 underline">scores.sebi.gov.in</a>) referencing the claim data.</p>
          </div>
        </div>
      )}

      {/* Main Grid: Form + Statutory Guidance Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-blue-600" />
            <span>Submit a Financial Content Report</span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700">
                {error}
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Content URL / Link *</label>
              <input
                type="url"
                required
                placeholder="https://twitter.com/... or https://youtube.com/... or https://t.me/..."
                value={contentUrl}
                onChange={(e) => setContentUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !contentUrl.trim()}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white font-semibold rounded-lg text-xs shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? 'Submitting Report...' : 'Submit Report'}</span>
            </button>
          </form>
        </div>

        {/* Regulatory Guidance Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Statutory Redressal Channels
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Official Indian government and regulator channels for reporting illegal financial activities:
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span>SEBI SCORES 2.0</span>
                  <a href="https://scores.sebi.gov.in" target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 flex items-center gap-0.5">
                    <span>Visit</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Official complaints against unregistered finfluencers & stock tips.</p>
                <span className="text-[10px] text-slate-400 font-mono mt-1 block">Toll-free: 1800 266 7575</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span>Cyber Crime Portal</span>
                  <a href="https://cybercrime.gov.in" target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 flex items-center gap-0.5">
                    <span>Visit</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Report advance fee fraud, Telegram pump channels, & crypto scams.</p>
                <span className="text-[10px] text-slate-400 font-mono mt-1 block">Helpline: 1930</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span>ASCI Complaints</span>
                  <a href="https://www.ascionline.in" target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 flex items-center gap-0.5">
                    <span>Visit</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Influencer violations lacking #Sponsored or #Advertisement tags.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recorded Reports Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Recently Recorded Community Reports</h3>
        {reports.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">No reports recorded yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {reports.map((r) => (
              <div key={r.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-blue-600">{r.id}</span>
                    <span className="font-semibold text-slate-800">{r.reason}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-medium">{r.creator_name}</span>
                  </div>
                  <p className="text-slate-500 mt-0.5 italic">"{r.description}"</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full self-start sm:self-auto">
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
