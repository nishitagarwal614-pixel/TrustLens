import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Square, 
  Mic, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2, 
  Info,
  ChevronDown
} from 'lucide-react';
import { 
  isSpeechRecognitionSupported, 
  startVoiceRecognition, 
  speakResponse, 
  stopSpeaking, 
  processVoiceQuery 
} from '../services/voiceService';
import { useLanguage } from '../context/LanguageContext';

export default function AnalyzeVoiceExplainer({ result, content }) {
  const { language } = useLanguage();
  const [state, setState] = useState('IDLE'); // 'IDLE' | 'LISTENING' | 'PROCESSING' | 'SPEAKING' | 'ERROR'
  const [isMuted, setIsMuted] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState('');
  const [activeAnswer, setActiveAnswer] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [history, setHistory] = useState([]);
  const recognizerRef = useRef(null);
  const isSupported = isSpeechRecognitionSupported();

  useEffect(() => {
    return () => {
      if (recognizerRef.current) {
        recognizerRef.current.abort();
      }
      stopSpeaking();
    };
  }, []);

  // Handler to Read Entire Analysis Aloud (Requirement 3 & 8)
  const handleReadAnalysisAloud = () => {
    stopSpeaking();
    const riskText = result.risk_level === 'high' ? 'potential risk' : (result.risk_level === 'safe' ? 'likely genuine' : 'moderate risk');
    const spokenSummary = `This claim has been classified as a ${riskText}. Overall status is ${result.overall_status}. ${result.explanation || ''} ${
      result.red_flags?.length > 0 
        ? `We detected ${result.red_flags.length} red flag${result.red_flags.length === 1 ? '' : 's'}.` 
        : 'No deceptive return promises were detected.'
    }`;

    setActiveQuestion('Read the analysis to me');
    setActiveAnswer(spokenSummary);
    setState('SPEAKING');

    speakResponse(spokenSummary, {
      isMuted,
      lang: language,
      onStart: () => setState('SPEAKING'),
      onEnd: () => setState('IDLE'),
      onError: () => setState('IDLE')
    });
  };

  const handleStartListening = () => {
    if (!isSupported) {
      setState('ERROR');
      setErrorMessage('Voice input is not supported in this browser. Please use a supported browser or type your content manually.');
      return;
    }

    stopSpeaking();
    setErrorMessage('');
    setState('LISTENING');

    const recognizer = startVoiceRecognition({
      lang: language,
      onStart: () => setState('LISTENING'),
      onResult: (transcript) => {
        setActiveQuestion(transcript);
        setState('PROCESSING');
        handleProcessResultQuery(transcript);
      },
      onError: (err) => {
        setState('ERROR');
        setErrorMessage(err.message || 'Could not understand. Please try again.');
        setTimeout(() => setState('IDLE'), 4000);
      },
      onEnd: ({ hasResult }) => {
        if (!hasResult && state === 'LISTENING') {
          setState('IDLE');
        }
      }
    });

    recognizerRef.current = recognizer;
  };

  const handleStopListening = () => {
    if (recognizerRef.current) {
      recognizerRef.current.stop();
      recognizerRef.current = null;
    }
    setState('IDLE');
  };

  const handleStopSpeaking = () => {
    stopSpeaking();
    setState('IDLE');
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (nextMuted) {
      stopSpeaking();
      if (state === 'SPEAKING') setState('IDLE');
    }
  };

  const handleProcessResultQuery = (queryText) => {
    const res = processVoiceQuery(queryText, {
      page: 'analyze',
      activeResult: result,
      history
    });

    setActiveAnswer(res.text);
    setHistory(prev => [...prev.slice(-4), { user: queryText, bot: res.text }]);
    setState('SPEAKING');

    speakResponse(res.spokenText || res.text, {
      isMuted,
      lang: language,
      onStart: () => setState('SPEAKING'),
      onEnd: () => setState('IDLE'),
      onError: () => setState('IDLE')
    });
  };

  const handleQuickQuestion = (q) => {
    setActiveQuestion(q);
    setState('PROCESSING');
    handleProcessResultQuery(q);
  };

  return (
    <div className="bg-white rounded-xl border border-blue-200 shadow-sm p-4 sm:p-5 space-y-4">
      {/* Top Banner & Minimal Voice Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-600">
            <Mic className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-[#0B2E73] flex items-center gap-1.5">
              <span>Voice Explainer &amp; Audio Verification</span>
              <span className="text-[10px] bg-[#F2F0FA] text-[#4635B1] border border-[#C8C1E8] px-1.5 py-0.5 rounded font-bold">AI Voice</span>
            </h4>
            <p className="text-[11px] text-[#4B5563]">Listen to verbal explanation or ask questions using your microphone</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Read Aloud Button */}
          <button
            type="button"
            onClick={state === 'SPEAKING' ? handleStopSpeaking : handleReadAnalysisAloud}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            title="Read summary aloud"
          >
            {state === 'SPEAKING' ? (
              <>
                <Square className="w-3.5 h-3.5 text-blue-700" />
                <span>Stop Speaking</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-blue-700" />
                <span>Read Analysis Aloud</span>
              </>
            )}
          </button>

          {/* Ask Voice Button */}
          <button
            type="button"
            onClick={state === 'LISTENING' ? handleStopListening : handleStartListening}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              state === 'LISTENING'
                ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-300'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
            }`}
            title={state === 'LISTENING' ? 'Click to stop listening' : 'Ask question with voice'}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>{state === 'LISTENING' ? 'Done' : 'Ask with Voice'}</span>
          </button>

          {/* Mute Button */}
          <button
            type="button"
            onClick={toggleMute}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isMuted ? 'text-amber-700 bg-amber-50 border-amber-200' : 'text-slate-500 hover:text-slate-800 bg-slate-50 border-slate-200'
            }`}
            title={isMuted ? 'Unmute voice' : 'Mute voice'}
            aria-label={isMuted ? 'Unmute voice' : 'Mute voice'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Voice Status State Bar */}
      <div className="flex items-center justify-between text-xs px-1">
        <div className="flex items-center gap-2">
          {state === 'LISTENING' && (
            <span className="flex items-center gap-1.5 text-rose-700 font-bold">
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
              🔴 Listening…
              <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full border border-rose-300 ml-1">
                Microphone active
              </span>
            </span>
          )}

          {state === 'PROCESSING' && (
            <span className="flex items-center gap-1.5 text-purple-700 font-bold">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-600" />
              🟣 Analyzing…
            </span>
          )}

          {state === 'SPEAKING' && (
            <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
              <Volume2 className="w-3.5 h-3.5 animate-bounce text-emerald-600" />
              🟢 सतर्क SIGHT is responding…
            </span>
          )}

          {state === 'ERROR' && (
            <span className="flex items-center gap-1.5 text-amber-700 font-bold">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              ⚠ {errorMessage || 'Could not understand. Please try again.'}
            </span>
          )}

          {state === 'IDLE' && (
            <span className="flex items-center gap-1.5 text-slate-600 font-medium text-xs">
              <Mic className="w-3.5 h-3.5 text-blue-600" />
              🎙 Tap to speak or select a question below
            </span>
          )}
        </div>

        {state === 'LISTENING' && (
          <span className="text-[10px] text-slate-400">🔒 Microphone active only while recording</span>
        )}
      </div>

      {/* Spoken Response Presentation Box */}
      {(activeQuestion || activeAnswer) && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
          {activeQuestion && (
            <div className="text-slate-600">
              <span className="font-bold uppercase text-[10px] text-slate-400 block">Question:</span>
              <p className="font-semibold text-slate-800">"{activeQuestion}"</p>
            </div>
          )}

          {activeAnswer && (
            <div className="bg-[#F5F6F8] border border-[#D8DEE8] p-3 rounded-lg text-[#172033] space-y-1">
              <div className="flex items-center justify-between text-[#4635B1] font-bold text-[10px] uppercase">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#4635B1]" />
                  सतर्क SIGHT AI Voice Explanation:
                </span>
                {state === 'SPEAKING' && (
                  <button
                    type="button"
                    onClick={handleStopSpeaking}
                    className="text-[10px] text-[#123A8C] hover:text-[#0B2E73] underline cursor-pointer"
                  >
                    Stop Speaking
                  </button>
                )}
              </div>
              <p className="leading-relaxed text-xs sm:text-sm font-medium text-slate-900">{activeAnswer}</p>
            </div>
          )}
        </div>
      )}

      {/* Suggested Questions for this Result (Requirement 8) */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-semibold text-slate-500">Ask the Voice Assistant:</span>
        <div className="flex flex-wrap gap-2">
          {[
            'Is this claim trustworthy?',
            'Why is this marked as high risk?',
            'What red flags did you detect?',
            'What evidence supports this result?',
            'Explain this result simply.'
          ].map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleQuickQuestion(q)}
              className="text-xs bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-blue-300 font-medium transition-colors cursor-pointer"
            >
              "{q}"
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
