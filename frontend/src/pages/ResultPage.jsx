import React, { useState } from 'react';
import { 
  ShieldCheck, AlertTriangle, FileText, Flag, Building2, Tag, 
  Share2, AlertOctagon, RotateCcw, Award, CheckCircle2, Info 
} from 'lucide-react';
import RiskMeter from '../components/RiskMeter';
import ClaimCard from '../components/ClaimCard';
import RedFlagCard from '../components/RedFlagCard';
import EvidenceCard from '../components/EvidenceCard';
import DisclosureBadge from '../components/DisclosureBadge';
import ReportModal from '../components/ReportModal';
import AnalyzeVoiceExplainer from '../components/AnalyzeVoiceExplainer';

export default function ResultPage({ result, content, sourceUrl, creatorName, onReset, onNavigate }) {
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pt-2 animate-in fade-in duration-300">
      {/* 1. Header Risk Assessment */}
      <RiskMeter
        overallStatus={result.overall_status}
        riskLevel={result.risk_level}
      />

      {/* Voice Verification & Explainer Bar */}
      <AnalyzeVoiceExplainer result={result} content={content} />

      {/* Synthesis Explanation Card */}
      <div className="bg-white rounded-xl border border-purple-200/80 p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-purple-700 uppercase tracking-wide">
          <Info className="w-4 h-4 text-purple-600" />
          <span>AI Forensic Verification Rationale</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-purple-50/40 p-3.5 rounded-lg border border-purple-200/60">
          {result.explanation}
        </p>

        {result.recommendation_detected && (
          <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 font-medium">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>Direct investment recommendation detected (Buy/Sell/Target directive). Not registered as financial advice.</span>
          </div>
        )}
      </div>

      {/* 2. Grid: Claims & Red Flags */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section: Claims Detected */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Claims Detected ({result.claims?.length || 0})
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">Green = Verified • Yellow = Unverified • Red = Contradicted</span>
          </div>

          <div className="space-y-2.5">
            {result.claims?.length > 0 ? (
              result.claims.map((claim, idx) => (
                <ClaimCard key={idx} claim={claim} />
              ))
            ) : (
              <div className="bg-white rounded-lg border border-slate-200 p-4 text-xs text-slate-400 text-center">
                No explicit financial assertions extracted from input.
              </div>
            )}
          </div>
        </div>

        {/* Section: Red-Flag Detector */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flag className="w-4 h-4 text-rose-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Red-Flag Detector ({result.red_flags?.length || 0})
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">SEBI / Regulatory Risk Signals</span>
          </div>

          <div className="space-y-2.5">
            {result.red_flags?.length > 0 ? (
              result.red_flags.map((flag, idx) => (
                <RedFlagCard key={idx} flag={flag} />
              ))
            ) : (
              <div className="bg-white rounded-lg border border-emerald-200 bg-emerald-50/20 p-4 text-xs text-emerald-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>No aggressive return guarantees, artificial urgency, or deceptive triggers detected.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Official Source Verification & Evidence Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Official-Source Verification (RAG Engine)
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">SEBI • NSE • BSE • Central Bank Publications</span>
        </div>

        <div className="space-y-2.5">
          {result.evidence && result.evidence.length > 0 ? (
            result.evidence.map((ev, idx) => (
              <EvidenceCard key={idx} evidence={ev} />
            ))
          ) : (
            <div className="bg-white rounded-lg border border-slate-200 p-6 text-center text-xs text-slate-500">
              <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-700">No supporting evidence found in the available sources.</p>
              <p className="text-[11px] text-slate-400 mt-1">
                The retrieved official exchange disclosures do not contain corroboration for the specific claims made.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 4. Disclosure Detection */}
      <div>
        <DisclosureBadge disclosure={result.disclosure} />
      </div>

      {/* 5. Bottom Actions: Report & Simulator Navigation */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsReportOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold shadow-sm transition-all"
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>Report This Content</span>
          </button>

          <button
            onClick={() => onNavigate('simulator')}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold shadow-sm transition-all"
          >
            <Award className="w-3.5 h-3.5 text-blue-600" />
            <span>Test Yourself in Simulator</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-xs font-medium transition-all"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copied ? 'Link Copied!' : 'Share Analysis'}</span>
          </button>
        </div>

        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-semibold"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Verify Another Post</span>
        </button>
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        initialData={{
          postId: result.id,
          content: content,
          sourceUrl: sourceUrl,
          creatorName: creatorName,
          claimText: result.claims?.[0]?.text
        }}
      />
    </div>
  );
}
