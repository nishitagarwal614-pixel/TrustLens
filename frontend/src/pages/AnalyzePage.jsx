import React, { useState, useEffect } from 'react';
import { Search, RotateCcw, Sparkles, AlertCircle, FileText, ArrowRight } from 'lucide-react';
import { analyzeContent } from '../services/api';
import AnalysisLoading from '../components/AnalysisLoading';
import ResultPage from './ResultPage';
import { DEMO_PRESETS } from '../data/demoData';
import { useLanguage } from '../context/LanguageContext';
import VoiceInputButton from '../components/VoiceInputButton';

export default function AnalyzePage({ initialPreset = null, autoRun = false, onNavigate }) {
  const { t, language } = useLanguage();
  const [content, setContent] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [creatorName, setCreatorName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Handle incoming preset or auto-run
  useEffect(() => {
    if (initialPreset) {
      setContent(initialPreset.content);
      setSourceUrl(initialPreset.sourceUrl || '');
      setCreatorName(initialPreset.creator || '');
      if (autoRun) {
        handleAnalyze(initialPreset.content, initialPreset.sourceUrl, initialPreset.creator);
      }
    }
  }, [initialPreset, autoRun]);

  const handleAnalyze = async (textToAnalyze, urlToAnalyze, creatorToAnalyze) => {
    const targetContent = textToAnalyze !== undefined ? textToAnalyze : content;
    const targetUrl = urlToAnalyze !== undefined ? urlToAnalyze : sourceUrl;
    const targetCreator = creatorToAnalyze !== undefined ? creatorToAnalyze : creatorName;

    if (!targetContent || targetContent.trim().length < 5) {
      setError('Please enter at least 5 characters of financial content to analyze.');
      return;
    }

    setError('');
    setLoading(true);
    setResult(null);

    try {
      const data = await analyzeContent(targetContent, targetUrl, targetCreator);
      setResult(data);
    } catch (err) {
      console.error('Analyze failed:', err);
      setError(err.message || 'An error occurred during verification. Please check backend status and retry.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setContent('');
    setSourceUrl('');
    setCreatorName('');
    setError('');
    setResult(null);
  };

  const applyPreset = (preset) => {
    setContent(preset.content);
    setSourceUrl(preset.sourceUrl || '');
    setCreatorName(preset.creator || '');
    setError('');
    setResult(null);
  };

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          {t?.analyze?.title || 'Analyze Financial Content'}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          {t?.analyze?.subtitle || 'Paste any financial post, tweet, video caption, or advisory claim to run a comprehensive forensic verification against official sources.'}
        </p>
      </div>

      {/* Input Box Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        {/* Preset Selector Chips */}
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>{t?.landing?.demoSectionTitle || 'Load Example Scenario:'}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {DEMO_PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => applyPreset(p)}
                className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                  content === p.content
                    ? 'bg-blue-50 border-blue-400 text-blue-700 font-bold'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Text Input with Voice Option */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="block text-xs font-bold text-slate-700">
              Financial Claim / Post Content:
            </label>
            <VoiceInputButton
              buttonText="Speak Financial Content"
              lang={language}
              onTranscript={(spoken) => {
                setContent((prev) => prev && prev.trim() ? `${prev.trim()} ${spoken}` : spoken);
              }}
            />
          </div>
          <textarea
            rows={5}
            placeholder={t?.analyze?.placeholderContent || "Paste a financial post, caption, article or claim here... e.g. 'XYZ stock is guaranteed to rise 50% next week. Buy now!'"}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-4 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-sans"
          />
        </div>

        {/* Optional Metadata: URL & Creator */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              {t?.analyze?.labelUrl || 'Source URL (Optional)'}
            </label>
            <input
              type="url"
              placeholder="https://twitter.com/... or https://telegram.me/..."
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-md text-xs focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              {t?.analyze?.labelCreator || 'Creator / Profile Handle (Optional)'}
            </label>
            <input
              type="text"
              placeholder="@CreatorHandle"
              value={creatorName}
              onChange={(e) => setCreatorName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-md text-xs focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAnalyze()}
              disabled={loading || !content.trim()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold text-xs shadow-sm transition-all hover:scale-102 active:scale-98 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{loading ? (t?.landing?.scanning || 'Analyzing Content...') : (t?.analyze?.btnAnalyze || 'Analyze Content')}</span>
            </button>

            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium text-xs transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{t?.analyze?.btnReset || 'Clear'}</span>
            </button>
          </div>

          <span className="text-[11px] text-slate-400">
            Powered by RAG Official Exchange Filings & NLP Engine
          </span>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading state */}
      {loading && <AnalysisLoading />}

      {/* Structured Result Display */}
      {result && !loading && (
        <ResultPage
          result={result}
          content={content}
          sourceUrl={sourceUrl}
          creatorName={creatorName}
          onReset={handleClear}
          onNavigate={onNavigate}
        />
      )}
    </div>
  );
}
