import React, { useState } from 'react';
import {
  AlertTriangle,
  FileText,
  Flag,
  Building2,
  Share2,
  AlertOctagon,
  RotateCcw,
  Award,
  CheckCircle2,
  Info
} from 'lucide-react';

import RiskMeter from '../components/RiskMeter';
import ClaimCard from '../components/ClaimCard';
import RedFlagCard from '../components/RedFlagCard';
import EvidenceCard from '../components/EvidenceCard';
import DisclosureBadge from '../components/DisclosureBadge';
import ReportModal from '../components/ReportModal';

export default function ResultPage({
  result,
  content,
  sourceUrl,
  creatorName,
  onReset,
  onNavigate
}) {
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const claims = result?.claims || [];
  const redFlags = result?.red_flags || [];
  const evidence = result?.evidence || result?.sources || [];

  return (
    <div className="space-y-6 pt-2 animate-in fade-in duration-300">

      {/* 1. OVERALL RESULT */}
      <RiskMeter
        overallStatus={result?.overall_status}
        riskLevel={result?.risk_level}
      />

      {/* 2. VERIFICATION SUMMARY */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">

        <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wide">
          <Info className="w-4 h-4 text-blue-600" />
          <span>Verification Summary</span>
        </div>

        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-lg border border-slate-200/80">
          {result?.summary ||
            result?.explanation ||
            'We checked the information you provided against available sources.'}
        </p>

        {result?.recommendation_detected && (
          <div className="flex items-start gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 font-medium">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />

            <span>
              This content appears to contain a direct investment recommendation
              such as a Buy, Sell, or Target directive. TrustLens does not treat
              this analysis as financial advice.
            </span>
          </div>
        )}

        {result?.uncertainty && (
          <div className="flex items-start gap-2 text-[11px] text-slate-500 pt-1">
            <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-slate-400" />

            <span>
              {result.uncertainty}
            </span>
          </div>
        )}
      </div>

      {/* 3. CLAIMS + SAFETY CHECK */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* CLAIMS */}
        <div className="space-y-3">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />

              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Claims We Checked ({claims.length})
              </h3>
            </div>

            <span className="text-[10px] text-slate-400 hidden sm:block">
              We check factual statements against available evidence
            </span>

          </div>

          <div className="space-y-2.5">

            {claims.length > 0 ? (
              claims.map((claim, idx) => (
                <ClaimCard
                  key={idx}
                  claim={claim}
                />
              ))
            ) : (
              <div className="bg-white rounded-lg border border-slate-200 p-5 text-center">

                <FileText className="w-7 h-7 text-slate-300 mx-auto mb-2" />

                <p className="text-xs font-semibold text-slate-700">
                  No specific factual claim was found.
                </p>

                <p className="text-[11px] text-slate-400 mt-1">
                  Try providing a specific statement, article, post, or source URL.
                </p>

              </div>
            )}

          </div>
        </div>

        {/* SAFETY CHECK */}
        <div className="space-y-3">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-2">
              <Flag className="w-4 h-4 text-rose-600" />

              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Safety Check
              </h3>
            </div>

            <span className="text-[10px] text-slate-400 hidden sm:block">
              Common warning signs
            </span>

          </div>

          <div className="space-y-2.5">

            {redFlags.length > 0 ? (
              redFlags.map((flag, idx) => (
                <RedFlagCard
                  key={idx}
                  flag={flag}
                />
              ))
            ) : (
              <div className="bg-white rounded-lg border border-emerald-200 bg-emerald-50/20 p-4">

                <div className="flex items-start gap-2">

                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />

                  <div>
                    <p className="text-xs font-semibold text-emerald-800">
                      No obvious warning signs found
                    </p>

                    <p className="text-[11px] text-emerald-700/80 mt-1 leading-relaxed">
                      We did not detect common warning signs such as guaranteed
                      returns, artificial urgency, or deceptive pressure tactics.
                    </p>
                  </div>

                </div>

              </div>
            )}

          </div>
        </div>
      </div>

      {/* 4. WHAT RELIABLE SOURCES SAY */}
      <div className="space-y-3">

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-2">

            <Building2 className="w-4 h-4 text-blue-600" />

            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              What Reliable Sources Say
            </h3>

          </div>

          <span className="text-[10px] text-slate-400 hidden sm:block">
            Official and other reliable sources
          </span>

        </div>

        <div className="space-y-2.5">

          {evidence.length > 0 ? (
            evidence.map((ev, idx) => (
              <EvidenceCard
                key={idx}
                evidence={ev}
              />
            ))
          ) : (
            <div className="bg-white rounded-lg border border-slate-200 p-6 text-center">

              <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />

              <p className="font-semibold text-sm text-slate-700">
                We couldn't find enough reliable evidence.
              </p>

              <p className="text-[11px] text-slate-400 mt-1 max-w-xl mx-auto leading-relaxed">
                This does not mean the claim is false. It means we could not
                find enough reliable information to confirm or contradict it.
              </p>

              {sourceUrl && (
                <p className="text-[11px] text-blue-600 mt-2">
                  You can also check the original source you provided.
                </p>
              )}

            </div>
          )}

        </div>
      </div>

      {/* 5. SPONSORSHIP */}
      <div>
        <DisclosureBadge
          disclosure={result?.disclosure}
        />
      </div>

      {/* 6. ACTIONS */}
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
            <span>Learn How to Spot Claims</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-xs font-medium transition-all"
          >
            <Share2 className="w-3.5 h-3.5" />

            <span>
              {copied ? 'Link Copied!' : 'Share Analysis'}
            </span>
          </button>

        </div>

        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-semibold"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Check Another Post</span>
        </button>

      </div>

      {/* REPORT MODAL */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        initialData={{
          postId: result?.id,
          content,
          sourceUrl,
          creatorName,
          claimText:
            claims?.[0]?.claim ||
            claims?.[0]?.text ||
            ''
        }}
      />

    </div>
  );
}