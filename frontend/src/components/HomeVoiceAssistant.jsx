import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  Square, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  X, 
  AlertTriangle, 
  Loader2, 
  ChevronUp, 
  ChevronDown,
  ArrowRight,
  MessageSquare
} from 'lucide-react';
import { 
  isSpeechRecognitionSupported, 
  startVoiceRecognition, 
  speakResponse, 
  stopSpeaking, 
  processVoiceQuery 
} from '../services/voiceService';
import { useLanguage } from '../context/LanguageContext';

export default function HomeVoiceAssistant({ onNavigate, onFillScanner, activeResult = null }) {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [state, setState] = useState('IDLE'); // 'IDLE' | 'LISTENING' | 'PROCESSING' | 'SPEAKING' | 'ERROR'
  const [userTranscript, setUserTranscript] = useState('');
  const [botResponse, setBotResponse] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [pendingAction, setPendingAction] = useState(null);

  const recognizerRef = useRef(null);
  const isSupported = isSpeechRecognitionSupported();

  // Cleanup when unmounting or closing
  useEffect(() => {
    return () => {
      if (recognizerRef.current) {
        recognizerRef.current.abort();
      }
      stopSpeaking();
    };
  }, []);

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
      onStart: () => {
        setState('LISTENING');
      },
      onResult: (transcript) => {
        setUserTranscript(transcript);
        setState('PROCESSING');

        // Process query through conversational engine
        setTimeout(() => {
          handleProcessQuery(transcript);
        }, 300);
      },
      onError: (err) => {
        setState('ERROR');
        setErrorMessage(err.message || 'Could not understand. Please try again.');
        setTimeout(() => {
          setState('IDLE');
        }, 4000);
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
    if (state === 'LISTENING') {
      setState('IDLE');
    }
  };

  const handleStopSpeaking = () => {
    stopSpeaking();
    if (state === 'SPEAKING') {
      setState('IDLE');
    }
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (nextMuted) {
      stopSpeaking();
      if (state === 'SPEAKING') setState('IDLE');
    }
  };

  const handleProcessQuery = (text) => {
    const result = processVoiceQuery(text, {
      page: 'landing',
      activeResult,
      history: conversationHistory
    });

    setBotResponse(result.text);
    setConversationHistory(prev => [...prev.slice(-4), { user: text, bot: result.text }]);
    setPendingAction(result.action || null);

    // Speak response out loud
    setState('SPEAKING');
    speakResponse(result.spokenText || result.text, {
      isMuted,
      lang: language,
      onStart: () => {
        setState('SPEAKING');
      },
      onEnd: () => {
        setState('IDLE');
        // If query was a direct navigation intent, execute action
        if (result.action?.type === 'navigate' && onNavigate) {
          setTimeout(() => {
            onNavigate(result.action.page);
          }, 800);
        } else if (result.action?.type === 'submit_content' && onFillScanner) {
          onFillScanner(result.action.content);
        }
      },
      onError: () => {
        setState('IDLE');
      }
    });
  };

  const handleQuickQuestion = (q) => {
    setUserTranscript(q);
    setState('PROCESSING');
    handleProcessQuery(q);
  };

  return (
    <aside 
      className="fixed bottom-5 right-5 z-40 max-w-sm w-full sm:w-96 select-none font-sans"
      aria-label="सतर्क SIGHT Voice Assistant"
    >
      {/* Collapsed State: Sleek Floating Voice Pill */}
      {!isOpen ? (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => {
              setIsOpen(true);
            }}
            className="flex items-center gap-2.5 px-4 py-3 bg-[#123A8C] hover:bg-[#0B2E73] text-white rounded-full shadow-xl border border-white/20 hover:border-[#FF9933] transition-all hover:scale-105 active:scale-95 group cursor-pointer"
            title="Open सतर्क SIGHT Voice Assistant"
            aria-label="Open Voice Assistant"
          >
            <div className="w-8 h-8 rounded-full bg-white/15 border border-white/20 flex items-center justify-center text-white group-hover:text-[#FF9933]">
              <Mic className="w-4 h-4" />
            </div>
            <div className="text-left pr-1">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Voice Assistant</span>
                <span className="w-2 h-2 rounded-full bg-[#138808] animate-pulse" />
              </div>
              <div className="text-[10px] text-blue-100/80">Tap to speak with सतर्क SIGHT AI</div>
            </div>
          </button>
        </div>
      ) : (
        /* Expanded Voice Assistant Card */
        <div className="bg-white border-2 border-[#D8DEE8] rounded-3xl shadow-2xl overflow-hidden transition-all animate-in fade-in slide-in-from-bottom-3 duration-200">
          
          {/* Header */}
          <div className="bg-[#0B2E73] text-white px-4 py-3 flex items-center justify-between border-b border-[#123A8C]">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-white/10 border border-white/20 text-white">
                <Mic className="w-4 h-4 text-[#FF9933]" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white tracking-tight flex items-center gap-1.5">
                  <span>सतर्क SIGHT Voice Assistant</span>
                  <span className="text-[10px] bg-[#4635B1] text-white font-bold px-1.5 py-0.2 rounded border border-[#4635B1]">AI</span>
                </h3>
                <p className="text-[10px] text-blue-100/75">Speech-to-Text &amp; Spoken Rationale</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Mute toggle */}
              <button
                type="button"
                onClick={toggleMute}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isMuted ? 'text-amber-400 bg-amber-950/40' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title={isMuted ? 'Unmute spoken responses' : 'Mute spoken responses'}
                aria-label={isMuted ? 'Unmute voice' : 'Mute voice'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              {/* Close */}
              <button
                type="button"
                onClick={() => {
                  stopSpeaking();
                  handleStopListening();
                  setIsOpen(false);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                title="Minimize assistant"
                aria-label="Minimize"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Assistant Body */}
          <div className="p-4 space-y-3.5 bg-slate-50/60 max-h-96 overflow-y-auto">
            
            {/* Voice Status Indicator Bar (Requirement 4: IDLE, LISTENING, PROCESSING, SPEAKING, ERROR) */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Voice State</span>
                {state === 'LISTENING' && (
                  <span className="text-[10px] font-semibold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full border border-rose-300 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
                    Microphone active
                  </span>
                )}
              </div>

              {/* Current Voice State Card */}
              <div className="flex items-center justify-between p-2.5 rounded-xl border transition-all bg-slate-50 border-slate-200">
                {state === 'LISTENING' && (
                  <div className="flex items-center gap-2 text-rose-700">
                    <Mic className="w-5 h-5 text-rose-600 animate-pulse" />
                    <div>
                      <div className="font-bold text-xs">🔴 Listening…</div>
                      <div className="text-[10px] text-rose-600">Speak your question clearly</div>
                    </div>
                  </div>
                )}

                {state === 'PROCESSING' && (
                  <div className="flex items-center gap-2 text-purple-700">
                    <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                    <div>
                      <div className="font-bold text-xs">🟣 Analyzing…</div>
                      <div className="text-[10px] text-purple-600">Processing speech request</div>
                    </div>
                  </div>
                )}

                {state === 'SPEAKING' && (
                  <div className="flex items-center gap-2 text-emerald-700">
                    <Volume2 className="w-5 h-5 animate-bounce text-emerald-600" />
                    <div>
                      <div className="font-bold text-xs">🟢 सतर्क SIGHT is responding…</div>
                      <div className="text-[10px] text-emerald-600">Playing spoken explanation</div>
                    </div>
                  </div>
                )}

                {state === 'ERROR' && (
                  <div className="flex items-center gap-2 text-amber-800">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                    <div>
                      <div className="font-bold text-xs">⚠ Error</div>
                      <div className="text-[10px] text-amber-700">{errorMessage || 'Could not understand. Please try again.'}</div>
                    </div>
                  </div>
                )}

                {state === 'IDLE' && (
                  <div className="flex items-center gap-2 text-slate-700">
                    <Mic className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="font-bold text-xs">🎙 Tap to speak</div>
                      <div className="text-[10px] text-slate-500">English, Hindi & Hinglish supported</div>
                    </div>
                  </div>
                )}

                {/* Primary Action Button */}
                <div className="flex items-center gap-1.5">
                  {state === 'SPEAKING' ? (
                    <button
                      type="button"
                      onClick={handleStopSpeaking}
                      className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      title="Stop speaking"
                    >
                      <Square className="w-3 h-3 text-slate-600" />
                      <span>Stop</span>
                    </button>
                  ) : state === 'LISTENING' ? (
                    <button
                      type="button"
                      onClick={handleStopListening}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-sm cursor-pointer transition-colors"
                      title="Finish speaking"
                    >
                      <Square className="w-3 h-3 fill-current" />
                      <span>Done</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleStartListening}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm hover:scale-102 active:scale-98 transition-all flex items-center gap-1.5 cursor-pointer"
                      title="Click to speak"
                    >
                      <Mic className="w-3.5 h-3.5" />
                      <span>Speak</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Conversation Dialog Box */}
            {(userTranscript || botResponse) && (
              <div className="space-y-2 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
                {userTranscript && (
                  <div className="bg-slate-100 p-2.5 rounded-xl text-xs text-slate-800">
                    <span className="font-bold text-slate-600 block text-[10px] uppercase">You said:</span>
                    <p className="mt-0.5 font-medium">"{userTranscript}"</p>
                  </div>
                )}

                {botResponse && (
                  <div className="bg-[#F5F6F8] border border-[#D8DEE8] p-2.5 rounded-xl text-xs text-[#172033] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#4635B1] text-[10px] uppercase flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-[#4635B1]" />
                        सतर्क SIGHT AI:
                      </span>
                      {state === 'SPEAKING' && (
                        <button
                          type="button"
                          onClick={handleStopSpeaking}
                          className="text-[10px] text-[#123A8C] hover:text-[#0B2E73] underline cursor-pointer"
                        >
                          Stop Voice
                        </button>
                      )}
                    </div>
                    <p className="leading-relaxed font-medium">{botResponse}</p>

                    {/* Pending Action buttons if applicable */}
                    {pendingAction?.type === 'submit_content' && (
                      <div className="pt-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            if (onFillScanner) onFillScanner(pendingAction.content);
                          }}
                          className="w-full py-1.5 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <span>Analyze in Home Scanner</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Quick Suggested Voice Questions */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-500">Try saying or tapping:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'What can Satark Sight do?',
                  'What does contradicted mean?',
                  'Can you analyze this financial claim?',
                  'Ye claim genuine hai kya?'
                ].map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleQuickQuestion(q)}
                    className="text-[11px] bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 px-2.5 py-1 rounded-lg border border-slate-200 hover:border-blue-300 font-medium transition-colors text-left cursor-pointer"
                  >
                    "{q}"
                  </button>
                ))}
              </div>
            </div>

            {/* Privacy Guarantee Note (Requirement 13) */}
            <div className="text-[10px] text-slate-400 text-center pt-1 border-t border-slate-200">
              🔒 Privacy-first: Microphone access only active while recording.
            </div>

          </div>
        </div>
      )}
    </aside>
  );
}
