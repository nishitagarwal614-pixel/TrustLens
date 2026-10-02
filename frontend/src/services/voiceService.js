/**
 * सतर्क SIGHT AI - Voice Interface Service
 * Browser-compatible SpeechRecognition (STT) and SpeechSynthesis (TTS)
 * Supports English, Hindi, and Hinglish natural conversational interactions.
 */

// 1. Browser API Feature Detection
export function isSpeechRecognitionSupported() {
  if (typeof window === 'undefined') return false;
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export function isSpeechSynthesisSupported() {
  if (typeof window === 'undefined') return false;
  return Boolean(window.speechSynthesis && typeof window.SpeechSynthesisUtterance !== 'undefined');
}

// 2. Speech-to-Text Recognition Helper
export function startVoiceRecognition({
  lang = 'en-IN',
  onStart,
  onResult,
  onError,
  onEnd
}) {
  if (!isSpeechRecognitionSupported()) {
    if (onError) {
      onError({
        code: 'unsupported',
        message: 'Voice input is not supported in this browser. Please use a supported browser or type your content manually.'
      });
    }
    return null;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  // Language mapping
  if (lang === 'hi') {
    recognition.lang = 'hi-IN';
  } else if (lang === 'mr') {
    recognition.lang = 'mr-IN';
  } else if (lang === 'ta') {
    recognition.lang = 'ta-IN';
  } else if (lang === 'te') {
    recognition.lang = 'te-IN';
  } else if (lang === 'kn') {
    recognition.lang = 'kn-IN';
  } else {
    recognition.lang = 'en-IN';
  }

  let hasResult = false;

  recognition.onstart = () => {
    if (onStart) onStart();
  };

  recognition.onresult = (event) => {
    if (event.results && event.results[0] && event.results[0][0]) {
      const transcript = event.results[0][0].transcript.trim();
      hasResult = true;
      if (onResult) onResult(transcript);
    }
  };

  recognition.onerror = (event) => {
    let userMessage = 'Could not understand. Please try again.';
    const errType = event.error;

    if (errType === 'not-allowed' || errType === 'service-not-allowed') {
      userMessage = 'Microphone permission denied. Please allow microphone access in your browser.';
    } else if (errType === 'no-speech') {
      userMessage = 'No speech detected. Please tap the microphone and speak again.';
    } else if (errType === 'audio-capture') {
      userMessage = 'No microphone was found on this device.';
    } else if (errType === 'network') {
      userMessage = 'Network connection issue during voice recognition.';
    }

    if (onError) {
      onError({ code: errType, message: userMessage });
    }
  };

  recognition.onend = () => {
    if (onEnd) onEnd({ hasResult });
  };

  try {
    recognition.start();
  } catch (err) {
    console.warn('SpeechRecognition start error:', err);
    if (onError) {
      onError({ code: 'start_failed', message: 'Could not activate microphone. Please try again.' });
    }
    return null;
  }

  return {
    stop: () => {
      try {
        recognition.stop();
      } catch (e) {
        // ignore
      }
    },
    abort: () => {
      try {
        recognition.abort();
      } catch (e) {
        // ignore
      }
    }
  };
}

// 3. Text-to-Speech Output Helper
export function speakResponse(text, {
  isMuted = false,
  lang = 'en-IN',
  onStart,
  onEnd,
  onError
} = {}) {
  if (!isSpeechSynthesisSupported()) {
    if (onEnd) onEnd();
    return { stop: () => {} };
  }

  // Always cancel any prior speaking
  stopSpeaking();

  if (isMuted || !text || !text.trim()) {
    if (onEnd) onEnd();
    return { stop: () => {} };
  }

  // Clean markdown / symbols for natural spoken speech
  const cleanSpokenText = text
    .replace(/[*_#`~[\]()]/g, '')
    .replace(/https?:\/\/\S+/g, 'link')
    .replace(/\s+/g, ' ')
    .trim();

  const utterance = new SpeechSynthesisUtterance(cleanSpokenText);
  utterance.rate = 1.0;
  utterance.pitch = 1.0;

  // Select suitable voice if available
  const voices = window.speechSynthesis.getVoices();
  if (voices && voices.length > 0) {
    let targetLang = 'en-IN';
    if (lang === 'hi') targetLang = 'hi-IN';

    const preferredVoice = voices.find(v => v.lang === targetLang) ||
      voices.find(v => v.lang.startsWith(targetLang.split('-')[0])) ||
      voices.find(v => v.lang.includes('en'));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
  }

  utterance.onstart = () => {
    if (onStart) onStart();
  };

  utterance.onend = () => {
    if (onEnd) onEnd();
  };

  utterance.onerror = (e) => {
    console.warn('SpeechSynthesis error:', e);
    if (onError) onError(e);
    if (onEnd) onEnd();
  };

  try {
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('SpeechSynthesis speak failed:', err);
    if (onEnd) onEnd();
  }

  return {
    stop: () => stopSpeaking()
  };
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      // ignore
    }
  }
}

// 4. Conversational Intelligence Engine (English, Hindi & Hinglish)
export function processVoiceQuery(query, context = {}) {
  const q = (query || '').toLowerCase().trim();
  const history = context.history || [];
  const lastBotReply = history.length > 0 ? history[history.length - 1].bot : '';
  const lastUserQuery = history.length > 0 ? history[history.length - 1].user.toLowerCase() : '';
  const activeResult = context.activeResult || null;

  // Check language flavor (Hinglish/Hindi indicators)
  const isHinglish = /\b(kya|hai|batao|karo|kaise|kyun|kyu|yeh|ye|matlab|dikhao|suno|karna|hoga)\b/i.test(q);

  // -------------------------------------------------------------------------
  // Case A: Contextual Follow-ups ("Why?", "Kyun?", "Show me the evidence")
  // -------------------------------------------------------------------------
  if (q === 'why' || q === 'why?' || q === 'kyun' || q === 'kyun?' || q === 'kyu' || q.includes('why is that') || q.includes('aisa kyun')) {
    if (lastUserQuery.includes('contradict') || lastBotReply.toLowerCase().includes('contradict')) {
      return {
        text: 'The available source data reports a different value from the claim you provided.',
        spokenText: 'The available source data reports a different value from the claim you provided.'
      };
    }
    if (activeResult) {
      if (activeResult.risk_level === 'high' || activeResult.overall_status === 'Contradicted') {
        const reason = activeResult.red_flags?.[0]?.description || 
          'The claim conflicts with official records or contains aggressive guaranteed-return promises without registration.';
        return {
          text: `This is flagged because: ${reason}`,
          spokenText: `This is flagged because: ${reason}`
        };
      }
      return {
        text: activeResult.explanation || 'The rating is based on cross-referencing company filings and regulatory databases.',
        spokenText: activeResult.explanation || 'The rating is based on cross-referencing company filings and regulatory databases.'
      };
    }
    return {
      text: 'सतर्क SIGHT cross-checks claims against verified exchange disclosures from NSE, BSE, and SEBI regulations.',
      spokenText: 'सतर्क SIGHT cross-checks claims against verified exchange disclosures from NSE, BSE, and SEBI regulations.'
    };
  }

  if (q.includes('show me the evidence') || q.includes('show evidence') || q.includes('evidence dikhao') || q.includes('saboot dikhao')) {
    if (activeResult && activeResult.evidence && activeResult.evidence.length > 0) {
      const topEv = activeResult.evidence[0];
      return {
        text: `Here is official evidence from ${topEv.source}: "${topEv.snippet || topEv.title}"`,
        spokenText: `Here is the official evidence supporting the verification result from ${topEv.source}.`,
        action: { type: 'highlight_evidence' }
      };
    }
    return {
      text: 'Here is the official evidence supporting the verification result. Exchange filings and statutory circulars are displayed in the evidence section.',
      spokenText: 'Here is the official evidence supporting the verification result.'
    };
  }

  // -------------------------------------------------------------------------
  // Case B: In Analyze Content context with active result
  // -------------------------------------------------------------------------
  if (activeResult) {
    if (q.includes('is this claim trustworthy') || q.includes('is this trustworthy') || q.includes('is this claim verified') || q.includes('is it safe') || q.includes('genuine hai kya')) {
      const status = activeResult.overall_status;
      const risk = activeResult.risk_level;
      if (risk === 'high' || status === 'Contradicted') {
        return {
          text: 'This claim has been classified as a potential risk. The statement contains guaranteed-return language and urgency. No supporting official evidence was found for the claim.',
          spokenText: 'This claim has been classified as a potential risk. The statement contains guaranteed-return language and urgency. No supporting official evidence was found for the claim.'
        };
      } else if (status === 'Verified' || risk === 'safe') {
        return {
          text: 'This claim appears likely genuine and matches official corporate filings or regulatory publications.',
          spokenText: 'This claim appears likely genuine and matches official corporate filings or regulatory publications.'
        };
      } else {
        return {
          text: 'This claim is currently unverified. The assertions could not be confirmed in statutory records. Please exercise caution.',
          spokenText: 'This claim is currently unverified. The assertions could not be confirmed in statutory records. Please exercise caution.'
        };
      }
    }

    if (q.includes('why is this marked as high risk') || q.includes('why high risk') || q.includes('high risk kyun')) {
      const flagCount = activeResult.red_flags?.length || 0;
      const firstFlag = activeResult.red_flags?.[0]?.description || 'guaranteed returns and artificial urgency';
      return {
        text: `This statement is marked high risk because ${flagCount} red flag${flagCount === 1 ? '' : 's'} were detected, including ${firstFlag}.`,
        spokenText: `This statement is marked high risk because red flags were detected, including ${firstFlag}. No official backing exists.`
      };
    }

    if (q.includes('what red flags') || q.includes('red flags detected') || q.includes('red flag kya hai')) {
      if (activeResult.red_flags && activeResult.red_flags.length > 0) {
        const flagList = activeResult.red_flags.map(f => f.type || f.description).slice(0, 3).join(', ');
        return {
          text: `Detected red flags: ${flagList}. These indicate deceptive marketing or high fraud risk under SEBI guidelines.`,
          spokenText: `We detected the following red flags: ${flagList}. These indicate deceptive marketing or potential fraud.`
        };
      }
      return {
        text: 'No deceptive triggers or guaranteed-return red flags were detected in this statement.',
        spokenText: 'No deceptive triggers or guaranteed-return red flags were detected in this statement.'
      };
    }

    if (q.includes('explain this result simply') || q.includes('simple explanation') || q.includes('aasan bhasha me samjhao')) {
      const simple = activeResult.explanation || `The overall status is ${activeResult.overall_status}.`;
      return {
        text: `Summary: ${simple}`,
        spokenText: `In simple terms: ${simple}`
      };
    }

    if (q.includes('read the analysis') || q.includes('read to me') || q.includes('suna do') || q.includes('padh ke batao')) {
      const readText = `Verdict: ${activeResult.overall_status}, with ${activeResult.risk_level} risk. ${activeResult.explanation}`;
      return {
        text: readText,
        spokenText: readText
      };
    }
  }

  // -------------------------------------------------------------------------
  // Case C: General Definitions & Knowledge Questions
  // -------------------------------------------------------------------------
  if (q.includes('contradicted') || q.includes('contradict')) {
    if (isHinglish) {
      return {
        text: 'Contradicted ka matlab hai ki yeh claim sarkari ya stock exchange ke official records se match nahi karta ya unse ulta hai.',
        spokenText: 'Contradicted ka matlab hai ki yeh claim sarkari ya stock exchange ke official records se match nahi karta ya unse ulta hai.'
      };
    }
    return {
      text: 'A contradicted claim is a statement that conflicts with available official evidence.',
      spokenText: 'A contradicted claim is a statement that conflicts with available official evidence.'
    };
  }

  if (q.includes('unverified') || q.includes('what is unverified')) {
    return {
      text: 'An unverified claim means no official regulatory filing or exchange disclosure was found to prove or disprove the statement.',
      spokenText: 'An unverified claim means no official regulatory filing or exchange disclosure was found to prove or disprove the statement.'
    };
  }

  if (q.includes('verified') && (q.includes('what does') || q.includes('meaning') || q.includes('matlab'))) {
    return {
      text: 'A verified claim is supported by audited filings, company disclosures, or official regulatory notices.',
      spokenText: 'A verified claim is supported by audited filings, company disclosures, or official regulatory notices.'
    };
  }

  if (q.includes('risk categor') || q.includes('risk level') || q.includes('risk types')) {
    return {
      text: 'सतर्क SIGHT uses three risk categories: Likely Genuine (low risk), Needs Caution (unverified / moderate risk), and Potential Fraud (high risk trap).',
      spokenText: 'सतर्क SIGHT uses three risk categories: Likely Genuine for low risk, Needs Caution for moderate risk, and Potential Fraud for high risk traps.'
    };
  }

  if (q.includes('red flag') || q.includes('red flags')) {
    return {
      text: 'Red flags include promises of guaranteed high returns, false urgency, unregistered tips, and pump-and-dump signals violating SEBI regulations.',
      spokenText: 'Red flags include promises of guaranteed high returns, false urgency, unregistered tips, and pump-and-dump signals violating SEBI regulations.'
    };
  }

  // -------------------------------------------------------------------------
  // Case D: Platform Capabilities ("What can सतर्क SIGHT do?")
  // -------------------------------------------------------------------------
  if (q.includes('what can satark sight do') || q.includes('what can trustlens do') || q.includes('what does satark sight do') || q.includes('what does trustlens do') || q.includes('kya karta hai') || q.includes('what is trustlens')) {
    if (isHinglish) {
      return {
        text: 'सतर्क SIGHT AI financial claims, WhatsApp tips aur social media posts ko scan karke official SEBI aur exchange records se cross-verify karta hai.',
        spokenText: 'सतर्क SIGHT AI financial claims, WhatsApp tips aur social media posts ko scan karke official SEBI aur exchange records se cross-verify karta hai.'
      };
    }
    return {
      text: 'सतर्क SIGHT AI analyzes financial content, detects potential red flags, and cross-checks claims against available official sources.',
      spokenText: 'सतर्क SIGHT AI analyzes financial content, detects potential red flags, and cross-checks claims against available official sources.'
    };
  }

  // -------------------------------------------------------------------------
  // Case E: Guidance to Analyze ("Can you analyze this claim?")
  // -------------------------------------------------------------------------
  if (q.includes('can you analyze this') || q.includes('analyze this claim') || q.includes('verify this claim') || q.includes('check this for me') || q.includes('verify karo')) {
    return {
      text: 'Sure. Please provide the financial content you want me to verify.',
      spokenText: 'Sure. Please provide the financial content you want me to verify.',
      action: { type: 'prompt_for_claim' }
    };
  }

  // -------------------------------------------------------------------------
  // Case F: Direct Analysis Request with Embedded Claim
  // (e.g. "Analyze XYZ stock is guaranteed to rise 50%")
  // -------------------------------------------------------------------------
  const analyzePrefixMatch = q.match(/^(?:analyze|verify|check|scan|is this claim true:?)\s+(.*)$/i);
  if (analyzePrefixMatch && analyzePrefixMatch[1] && analyzePrefixMatch[1].trim().length > 6) {
    const rawClaim = analyzePrefixMatch[1].trim();
    return {
      text: `Understood. Analyzing financial claim: "${rawClaim}"...`,
      spokenText: `Understood. Analyzing the financial claim now.`,
      action: { type: 'submit_content', content: rawClaim }
    };
  }

  // -------------------------------------------------------------------------
  // Case G: Hinglish Verification Question ("Ye claim genuine hai kya?")
  // -------------------------------------------------------------------------
  if (q.includes('genuine hai kya') || q.includes('sach hai kya') || q.includes('real hai kya') || q.includes('fraud hai kya')) {
    return {
      text: 'Is claim ko verify karne ke liye सतर्क SIGHT available official evidence ke saath compare karega. Kripya apna text ya photo scanner me dalein.',
      spokenText: 'Is claim ko verify karne ke liye सतर्क SIGHT available official evidence ke saath compare karega.'
    };
  }

  // -------------------------------------------------------------------------
  // Case H: Navigation Commands
  // -------------------------------------------------------------------------
  if (q.includes('go to analyze') || q.includes('open analyze') || q.includes('analyze page')) {
    return {
      text: 'Navigating to Analyze Content page...',
      spokenText: 'Navigating to Analyze Content page.',
      action: { type: 'navigate', page: 'analyze' }
    };
  }

  if (q.includes('practice mode') || q.includes('go to simulator') || q.includes('financial literacy') || q.includes('open simulator') || q.includes('open practice mode')) {
    return {
      text: 'Opening Practice Mode...',
      spokenText: 'Opening Practice Mode.',
      action: { type: 'navigate', page: 'simulator' }
    };
  }

  if (q.includes('go to history') || q.includes('open history') || q.includes('past verifications')) {
    return {
      text: 'Opening Verification History...',
      spokenText: 'Opening Verification History.',
      action: { type: 'navigate', page: 'history' }
    };
  }

  if (q.includes('go to reports') || q.includes('open reports')) {
    return {
      text: 'Opening Reports section...',
      spokenText: 'Opening Reports section.',
      action: { type: 'navigate', page: 'reports' }
    };
  }

  // -------------------------------------------------------------------------
  // Default Fallback
  // -------------------------------------------------------------------------
  return {
    text: `I heard: "${query}". You can ask me to analyze financial claims, explain verification statuses like Contradicted, explain red flags, or guide you through सतर्क SIGHT AI.`,
    spokenText: `You can ask me to analyze financial claims, explain verification statuses, or guide you through सतर्क SIGHT AI.`
  };
}
