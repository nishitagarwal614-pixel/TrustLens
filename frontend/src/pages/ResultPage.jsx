import React, { useState } from 'react';
import {
  AlertTriangle,
  FileText,
  Flag,
  Globe2,
  AlertOctagon,
  RotateCcw,
  CheckCircle2,
  Info,
  FileDown
} from 'lucide-react';

import RiskMeter from '../components/RiskMeter';
import ClaimCard from '../components/ClaimCard';
import RedFlagCard from '../components/RedFlagCard';
import EvidenceCard from '../components/EvidenceCard';
import DisclosureBadge from '../components/DisclosureBadge';
import ReportModal from '../components/ReportModal';
import AnalyzeVoiceExplainer from '../components/AnalyzeVoiceExplainer';
import { generateAnalysisPdf } from '../utils/generateAnalysisPdf';

export default function ResultPage({
  result,
  content,
  sourceUrl,
  creatorName,
  onReset
}) {
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const handleGeneratePdf = async () => {
    try {
      setGeneratingPdf(true);

      generateAnalysisPdf({
        result,
        content,
        sourceUrl,
        creatorName
      });
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Unable to generate the PDF report. Please try again.');
    } finally {
      setGeneratingPdf(false);
    }
  };

  const evidenceCount = result?.evidence?.length || 0;

  return (
    <div className="space-y-6 pt-2 animate-in fade-in duration-300">

      {/* 1. Header Risk Assessment */}
      <RiskMeter
        overallStatus={result.overall_status}
        riskLevel={result.risk_level}
      />

      {/* Voice Verification & Explainer */}
      <AnalyzeVoiceExplainer
        result={result}
        content={content}
      />

      {/* AI Verification Rationale */}
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

            <span>
              Direct investment recommendation detected
              (Buy/Sell/Target directive). Not registered as financial advice.
            </span>
          </div>
        )}
      </div>

      {/* 2. Claims & Red Flags */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Claims */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />

              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Claims Detected ({result.claims?.length || 0})
              </h3>
            </div>

            <span className="text-[11px] text-slate-400">
              Green = Verified • Yellow = Unverified • Red = Contradicted
            </span>
          </div>

          <div className="space-y-2.5">
            {result.claims?.length > 0 ? (
              result.claims.map((claim, idx) => (
                <ClaimCard
                  key={idx}
                  claim={claim}
                />
              ))
            ) : (
              <div className="bg-white rounded-lg border border-slate-200 p-4 text-xs text-slate-400 text-center">
                No explicit factual assertions extracted from input.
              </div>
            )}
          </div>
        </div>

        {/* Red Flags */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flag className="w-4 h-4 text-rose-600" />

              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Red-Flag Detector ({result.red_flags?.length || 0})
              </h3>
            </div>

            <span className="text-[11px] text-slate-400">
              Regulatory Risk Signals
            </span>
          </div>

          <div className="space-y-2.5">
            {result.red_flags?.length > 0 ? (
              result.red_flags.map((flag, idx) => (
                <RedFlagCard
                  key={idx}
                  flag={flag}
                />
              ))
            ) : (
              <div className="bg-white rounded-lg border border-emerald-200 bg-emerald-50/20 p-4 text-xs text-emerald-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />

                <span>
                  No aggressive return guarantees, artificial urgency,
                  or deceptive triggers detected.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Live Web Evidence */}
      <div className="space-y-3">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-blue-600" />

            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Live Web Evidence
            </h3>
          </div>

          <span className="text-[11px] text-slate-400">
            {evidenceCount > 0
              ? `${evidenceCount} source${evidenceCount === 1 ? '' : 's'} retrieved during this analysis`
              : 'No live sources retrieved'}
          </span>
        </div>

        <div className="bg-blue-50/50 border border-blue-200 rounded-lg px-4 py-3">
          <div className="flex items-start gap-2">
            <Globe2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />

            <div>
              <p className="text-xs font-semibold text-blue-800">
                Independent web evidence
              </p>

              <p className="text-[11px] text-blue-700 mt-0.5 leading-relaxed">
                These sources were retrieved from the live web and supplied
                to the verification engine for comparison with the submitted
                claim.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2.5">
          {result.evidence && result.evidence.length > 0 ? (
            result.evidence.map((ev, idx) => (
              <EvidenceCard
                key={ev.id || idx}
                evidence={ev}
              />
            ))
          ) : (
            <div className="bg-white rounded-lg border border-slate-200 p-6 text-center">
              <Globe2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />

              <p className="font-semibold text-slate-700 text-xs">
                No live web evidence was retrieved.
              </p>

              <p className="text-[11px] text-slate-400 mt-1">
                The claim cannot be considered verified without supporting
                evidence from retrieved sources.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 4. Disclosure Detection */}
      <div>
        <DisclosureBadge
          disclosure={result.disclosure}
        />
      </div>

      {/* 5. Bottom Actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">

        <div className="flex items-center gap-2 flex-wrap">

          {/* Report */}
          <button
            onClick={() => setIsReportOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold shadow-sm transition-all"
          >
            <AlertOctagon className="w-3.5 h-3.5" />

            <span>
              Report This Content
            </span>
          </button>

          {/* Convert to PDF */}
          <button
            onClick={handleGeneratePdf}
            disabled={generatingPdf}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 hover:bg-blue-100 disabled:bg-slate-100 disabled:text-slate-400 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold shadow-sm transition-all disabled:cursor-not-allowed"
          >
            <FileDown className="w-3.5 h-3.5" />

            <span>
              {generatingPdf
                ? 'Generating PDF...'
                : 'Convert to PDF'}
            </span>
          </button>
        </div>

        {/* Verify another post */}
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-semibold"
        >
          <RotateCcw className="w-3.5 h-3.5" />

          <span>
            Verify Another Post
          </span>
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