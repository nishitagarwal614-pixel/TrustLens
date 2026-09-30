import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle, ExternalLink, ShieldAlert } from 'lucide-react';
import { submitReport } from '../services/api';

export default function ReportModal({ isOpen, onClose, initialData = {} }) {
  const [contentUrl, setContentUrl] = useState(initialData.sourceUrl || '');
  const [creatorName, setCreatorName] = useState(initialData.creatorName || '');
  const [detectedClaim, setDetectedClaim] = useState(initialData.claimText || '');
  const [reason, setReason] = useState('Unregistered advisory / Guaranteed returns');
  const [description, setDescription] = useState(initialData.content ? `Flagged content:\n"${initialData.content.substring(0, 150)}..."` : '');
  const [loading, setLoading] = useState(false);
  const [reportResult, setReportResult] = useState(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Please provide a brief description.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await submitReport({
        post_id: initialData.postId || null,
        content_url: contentUrl,
        creator_name: creatorName,
        reason,
        description,
        detected_claim: detectedClaim
      });
      setReportResult(res);
    } catch (err) {
      setError(err.message || 'Failed to record report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2 text-rose-600">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="font-bold text-slate-900 text-sm">Report Misleading Financial Content</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {reportResult ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">Your report has been recorded.</h4>
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200 rounded-md font-mono text-xs font-bold text-slate-800">
                  <span>Report ID:</span>
                  <span className="text-blue-600">{reportResult.id}</span>
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  Status: <span className="font-semibold text-emerald-600">{reportResult.status}</span>
                </div>
              </div>

              {/* Regulatory Guidance Box */}
              <div className="text-left bg-blue-50/70 border border-blue-200 rounded-lg p-3.5 text-xs space-y-2 mt-4">
                <div className="flex items-center gap-1.5 font-bold text-blue-900">
                  <ShieldAlert className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>Regulatory Reporting Guidance</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  {reportResult.regulatory_guidance.notice}
                </p>
                <div className="space-y-1.5 pt-1">
                  {reportResult.regulatory_guidance.official_reporting_channels.map((ch, i) => (
                    <div key={i} className="text-[11px] bg-white p-2 rounded border border-blue-100 flex items-start justify-between gap-2">
                      <div>
                        <strong className="text-slate-800 block">{ch.authority}</strong>
                        <span className="text-slate-500">{ch.purpose}</span>
                      </div>
                      <a href={ch.portal} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 flex items-center gap-0.5 flex-shrink-0 font-medium">
                        <span>Portal</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              {error && (
                <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {error}
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Content URL / Post Link</label>
                <input
                  type="url"
                  placeholder="https://twitter.com/..."
                  value={contentUrl}
                  onChange={(e) => setContentUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:border-blue-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Creator / Profile Handle</label>
                  <input
                    type="text"
                    placeholder="@CreatorName"
                    value={creatorName}
                    onChange={(e) => setCreatorName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:border-blue-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Primary Violation Reason</label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:border-blue-500 text-xs bg-white"
                  >
                    <option value="Unregistered advisory / Guaranteed returns">Unregistered advisory / Guaranteed returns</option>
                    <option value="Urgency manipulation / Pump and dump">Urgency manipulation / Pump and dump</option>
                    <option value="Missing #Sponsored disclosure">Missing #Sponsored disclosure</option>
                    <option value="Contradiction of audited filings">Contradiction of audited filings</option>
                    <option value="Deceptive subscription or tips funnel">Deceptive subscription or tips funnel</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Detected Specific Claim (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Guaranteed 50% profit next week"
                  value={detectedClaim}
                  onChange={(e) => setDetectedClaim(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:border-blue-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description & Evidence Details *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe why this content is deceptive or contrary to regulatory guidelines..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:border-blue-500 text-xs resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 border border-slate-200 rounded-md text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-md font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  {loading ? 'Recording...' : 'Submit Report'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
