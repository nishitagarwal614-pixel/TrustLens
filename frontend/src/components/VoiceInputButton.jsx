import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Square, Volume2, VolumeX, AlertTriangle, Loader2 } from 'lucide-react';
import { 
  isSpeechRecognitionSupported, 
  startVoiceRecognition, 
  stopSpeaking,
  speakResponse
} from '../services/voiceService';

/**
 * VoiceInputButton
 * Standardized voice input control with explicit states, privacy badge, and controls.
 * States:
 * - IDLE: 🎙 "Tap to speak"
 * - LISTENING: 🔴 "Listening… (Microphone active)"
 * - PROCESSING: 🟣 "Analyzing…"
 * - SPEAKING: 🔵 "सतर्क SIGHT is responding…"
 * - ERROR: ⚠ "Could not understand. Please try again."
 */
export default function VoiceInputButton({
  onTranscript,
  onSpeechStart,
  onSpeechEnd,
  className = '',
  buttonText = 'Tap to speak',
  size = 'md', // 'sm' | 'md' | 'lg'
  lang = 'en',
  autoSpeakResponse = false,
  responseText = '',
  compact = false
}) {
  const [state, setState] = useState('IDLE'); // 'IDLE' | 'LISTENING' | 'PROCESSING' | 'SPEAKING' | 'ERROR'
  const [errorMessage, setErrorMessage] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const recognizerRef = useRef(null);
  const isSupported = isSpeechRecognitionSupported();

  // Cleanup on unmount
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

    // Stop any ongoing speech
    stopSpeaking();
    setErrorMessage('');
    setState('LISTENING');

    if (onSpeechStart) onSpeechStart();

    const recognizer = startVoiceRecognition({
      lang,
      onStart: () => {
        setState('LISTENING');
      },
      onResult: (transcript) => {
        setState('PROCESSING');
        if (onTranscript) {
          onTranscript(transcript);
        }
        setTimeout(() => {
          setState('IDLE');
        }, 1200);
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
        if (onSpeechEnd) onSpeechEnd();
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
    if (onSpeechEnd) onSpeechEnd();
  };

  const handleStopSpeaking = () => {
    stopSpeaking();
    setState('IDLE');
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (newMuted) {
      stopSpeaking();
      if (state === 'SPEAKING') setState('IDLE');
    }
  };

  // Render State Visuals
  const renderStateContent = () => {
    switch (state) {
      case 'LISTENING':
        return (
          <div className="flex items-center gap-2 text-rose-700">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
            </span>
            <Mic className="w-4 h-4 text-rose-600 animate-pulse" />
            <span className="font-bold text-xs sm:text-sm">Listening…</span>
            <span className="bg-rose-100 text-rose-800 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-rose-300">
              Microphone active
            </span>
          </div>
        );

      case 'PROCESSING':
        return (
          <div className="flex items-center gap-2 text-purple-700">
            <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
            <span className="font-bold text-xs sm:text-sm">Analyzing…</span>
          </div>
        );

      case 'SPEAKING':
        return (
          <div className="flex items-center gap-2 text-emerald-700">
            <Volume2 className="w-4 h-4 animate-bounce text-emerald-600" />
            <span className="font-bold text-xs sm:text-sm">🟢 सतर्क SIGHT is responding…</span>
          </div>
        );

      case 'ERROR':
        return (
          <div className="flex items-center gap-2 text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span className="font-bold text-xs truncate max-w-xs">{errorMessage || 'Could not understand. Please try again.'}</span>
          </div>
        );

      case 'IDLE':
      default:
        return (
          <div className="flex items-center gap-2 text-slate-700 group-hover:text-blue-700">
            <Mic className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-xs sm:text-sm">{buttonText}</span>
          </div>
        );
    }
  };

  return (
    <div className={`inline-flex flex-col gap-1.5 ${className}`}>
      <div className="inline-flex items-center gap-1.5 bg-white border border-slate-300 hover:border-blue-400 rounded-xl px-3 py-2 shadow-xs transition-all">
        {/* Main Mic Button */}
        <button
          type="button"
          onClick={state === 'LISTENING' ? handleStopListening : handleStartListening}
          className="flex items-center gap-2 cursor-pointer group focus:outline-none"
          title={state === 'LISTENING' ? 'Click to stop listening' : 'Click to speak using microphone'}
          aria-label={state === 'LISTENING' ? 'Stop listening' : 'Start speaking'}
        >
          {renderStateContent()}
        </button>

        {/* Minimal Auxiliary Controls: Stop speaking & Mute/Unmute */}
        <div className="flex items-center gap-1 border-l border-slate-200 pl-1.5 ml-1">
          {state === 'SPEAKING' && (
            <button
              type="button"
              onClick={handleStopSpeaking}
              className="p-1 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 cursor-pointer"
              title="Stop speaking"
              aria-label="Stop Speaking"
            >
              <Square className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={toggleMute}
            className={`p-1 rounded-lg transition-colors cursor-pointer ${
              isMuted ? 'text-amber-600 bg-amber-50' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
            title={isMuted ? 'Unmute voice output' : 'Mute voice output'}
            aria-label={isMuted ? 'Unmute voice' : 'Mute voice'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Privacy Notice while recording */}
      {state === 'LISTENING' && (
        <span className="text-[10px] text-slate-500 flex items-center gap-1 pl-1">
          🔒 Voice is processed locally in your browser. Not recorded in background.
        </span>
      )}
    </div>
  );
}
