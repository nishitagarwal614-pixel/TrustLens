import React, { useState, useEffect } from 'react';
import { 
  Award, Flame, Trophy, CheckCircle2, XCircle, ArrowRight, 
  RotateCcw, Sparkles, ShieldAlert, Star, ShieldCheck, ChevronRight,
  Filter, AlertTriangle
} from 'lucide-react';
import { fetchSimulatorQuestions, submitSimulatorAnswer, fetchSimulatorProfile } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export const PRACTICE_QUESTIONS = [
  {
    id: "prac-1",
    topic: "Scam/safety signals",
    title: "Guaranteed 4x Return Trap",
    author: "@FastWealthCrypto",
    post_text: "Invest ₹10,000 today in our private crypto arbitrage bot and withdraw guaranteed ₹40,000 in 14 days! 100% capital protected by insurance. Zero risk. DM admin immediately to register.",
    question: "Which scam/safety signal is the primary warning sign in this post?",
    options: [
      { id: "A", text: "Guaranteed 4x returns paired with zero-risk or capital protection claims" },
      { id: "B", text: "The investment amount is in Indian Rupees (₹)" },
      { id: "C", text: "The message mentions an arbitrage strategy" },
      { id: "D", text: "The holding duration is two weeks" }
    ],
    correct_option: "A",
    explanation: "Guaranteed high returns on market-linked investments do not exist. Any promise of '100% capital protection' paired with 4x returns is a definitive advance-fee or Ponzi scheme signal under SEBI regulations.",
    category: "Scam/safety signals",
    points: 10
  },
  {
    id: "prac-2",
    topic: "Urgency and FOMO",
    title: "The 3-Minute Panic Trigger",
    author: "@RapidGainsTrader",
    post_text: "URGENT: Only 3 minutes left before institutional buying drives this penny stock up +350%! Don't be left behind broke while others get rich. BUY IMMEDIATELY OR REGRET FOREVER!",
    question: "What psychological manipulation tactic is being deployed here?",
    options: [
      { id: "A", text: "Audited fundamental analysis of enterprise debt" },
      { id: "B", text: "Artificial urgency and Fear Of Missing Out (FOMO) to force impulsive buying without research" },
      { id: "C", text: "Conservative capital preservation" },
      { id: "D", text: "Regulatory compliance with exchange trading hours" }
    ],
    correct_option: "B",
    explanation: "Artificial time pressure ('only 3 minutes left') and emotional shame ('don't be left broke') are classic FOMO triggers engineered to bypass rational risk assessment.",
    category: "Urgency and FOMO",
    points: 10
  },
  {
    id: "prac-3",
    topic: "Scarcity and social proof",
    title: "Fabricated VIP Membership Quota",
    author: "@AlphaClubAdvisory",
    post_text: "Over 95,000 smart investors have already made millions in our VIP Trading Club! Only 2 subscriber spots remaining before admission closes permanently. Use code WIN99 now!",
    question: "Which deceptive persuasion tactic is demonstrated by claiming '95,000 members' and 'only 2 spots remaining'?",
    options: [
      { id: "A", text: "Scarcity and manufactured social proof to trigger herd mentality" },
      { id: "B", text: "Mandatory SEBI Research Analyst disclosure" },
      { id: "C", text: "Discount coupon validation logic" },
      { id: "D", text: "Quarterly earnings guidance" }
    ],
    correct_option: "A",
    explanation: "Artificial scarcity ('only 2 spots remaining') and fabricated social proof ('95,000 members made millions') create herd pressure to deceive retail investors into quick purchases.",
    category: "Scarcity and social proof",
    points: 10
  },
  {
    id: "prac-4",
    topic: "Unsupported claims",
    title: "The Secret 50x Wonder Drug",
    author: "@PharmaInsiderTips",
    post_text: "XYZ Biotech has secretly discovered a miracle treatment that will replace chemotherapy worldwide! The stock is guaranteed to jump 50x next month. Mark my words!",
    question: "Why should an investor treat this statement as an unsupported claim?",
    options: [
      { id: "A", text: "It makes an extraordinary assertion with zero clinical trial data, patent filings, or corporate disclosures" },
      { id: "B", text: "Biotechnology companies are prohibited from discovering treatments" },
      { id: "C", text: "Stock prices are never influenced by medical developments" },
      { id: "D", text: "The message is written in English" }
    ],
    correct_option: "A",
    explanation: "Sensational claims without corroborating clinical trials, patent grants, or official exchange notifications are speculative pump-and-dump claims intended to inflate share prices.",
    category: "Unsupported claims",
    points: 10
  },
  {
    id: "prac-5",
    topic: "Missing evidence",
    title: "Unverified Defense Contract Leak",
    author: "@MarketLeaksHQ",
    post_text: "CONFIDENTIAL LEAK: GreenEnergy Corp just signed a secret $3 Billion defense deal with the government! Stock hitting upper circuit at 9:15 AM tomorrow.",
    question: "What critical piece of evidence is missing before evaluating this information?",
    options: [
      { id: "A", text: "An official regulatory announcement filed by the company on NSE/BSE under Regulation 30" },
      { id: "B", text: "Fire emoji reactions in the private Telegram group" },
      { id: "C", text: "Retweets from anonymous trading handles" },
      { id: "D", text: "A forwarded screenshot of a private conversation" }
    ],
    correct_option: "A",
    explanation: "Listed companies are legally mandated under SEBI LODR Regulation 30 to report all material contracts directly to stock exchanges (NSE/BSE). Uncorroborated leaks lack official evidence.",
    category: "Missing evidence",
    points: 10
  },
  {
    id: "prac-6",
    topic: "Information that needs verification",
    title: "Sensational Q3 Earnings Post",
    author: "@FastMarketUpdates",
    post_text: "Audited Q3 results are out! ABC Tech reported a staggering 68% jump in net profit, zero debt, and declared a record 400% dividend to shareholders.",
    question: "How should a prudent investor handle this positive-sounding report?",
    options: [
      { id: "A", text: "Verify the figures against the official audited financial results uploaded to the stock exchange portal" },
      { id: "B", text: "Immediately buy maximum shares on leverage without reading the filing" },
      { id: "C", text: "Forward to WhatsApp investment groups" },
      { id: "D", text: "Assume all financial statistics posted online are verified by default" }
    ],
    correct_option: "A",
    explanation: "Even when financial metrics sound plausible, social media posts frequently inflate growth figures or omit debt. Always cross-verify against the official audited filing on NSE or BSE.",
    category: "Information that needs verification",
    points: 10
  },
  {
    id: "prac-7",
    topic: "Scam/safety signals",
    title: "Unregistered Advisory Trap",
    author: "@WealthWizardIndia",
    post_text: "Buy shares of XYZ Infra at ₹210 with target ₹390. 99% accuracy rate guaranteed. Send private message to join our paid portfolio advisory service.",
    question: "What mandatory credential should you verify before taking paid stock recommendations?",
    options: [
      { id: "A", text: "A valid SEBI Registered Research Analyst (RA) or Investment Adviser (IA) registration number on sebi.gov.in" },
      { id: "B", text: "Number of Instagram or YouTube followers" },
      { id: "C", text: "Luxury sports car photos and office video tours" },
      { id: "D", text: "Blue verified checkmark badge on social media" }
    ],
    correct_option: "A",
    explanation: "Under SEBI regulations, anyone offering investment advice or research reports must hold a valid SEBI registration number. Social media follower count or blue checkmarks do not confer legal authorization.",
    category: "Scam/safety signals",
    points: 10
  },
  {
    id: "prac-8",
    topic: "Urgency and FOMO",
    title: "100% Sure-Shot Intraday Call",
    author: "@IntradaySniperPro",
    post_text: "100% sure-shot call today in Nifty Options! Guaranteed 50 points profit before 11:00 AM. Enter immediately!",
    question: "Why is 'sure-shot intraday call' a misleading and high-risk claim?",
    options: [
      { id: "A", text: "SEBI studies reveal over 90% of retail F&O traders make net losses; no derivative trade is 100% guaranteed" },
      { id: "B", text: "Options trading can only be performed in the afternoon" },
      { id: "C", text: "Nifty options have fixed prices set by the government" },
      { id: "D", text: "All options expire at market open" }
    ],
    correct_option: "A",
    explanation: "Official SEBI market research shows that 9 out of 10 individual retail traders in equity F&O incur net losses. Promoting options trading as 'guaranteed' or 'sure-shot' is deceptive and illegal.",
    category: "Urgency and FOMO",
    points: 10
  }
];

export const PRACTICE_TOPICS = [
  'All Topics',
  'Scam/safety signals',
  'Urgency and FOMO',
  'Scarcity and social proof',
  'Unsupported claims',
  'Missing evidence',
  'Information that needs verification'
];

export default function SimulatorPage() {
  const { t } = useLanguage();
  const [selectedTopic, setSelectedTopic] = useState('All Topics');
  const [allQuestions, setAllQuestions] = useState(PRACTICE_QUESTIONS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [profile, setProfile] = useState({ score: 0, streak: 0, level: 'Novice Detective', badges: ['First Analysis'] });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Load questions and profile
  useEffect(() => {
    Promise.all([fetchSimulatorQuestions(), fetchSimulatorProfile()])
      .then(([qData, pData]) => {
        if (qData && qData.length > 0) {
          // Merge API questions with rich practice questions
          const merged = [...PRACTICE_QUESTIONS];
          qData.forEach(apiQ => {
            if (!merged.some(m => m.id === apiQ.id)) {
              merged.push(apiQ);
            }
          });
          setAllQuestions(merged);
        }
        if (pData) {
          setProfile(pData);
        }
      })
      .catch(err => {
        // Fallback to robust local practice questions
        console.warn('Using built-in practice questions:', err.message);
      });
  }, []);

  // Filter questions based on selected topic
  const filteredQuestions = selectedTopic === 'All Topics'
    ? allQuestions
    : allQuestions.filter(q => q.topic === selectedTopic || q.category === selectedTopic);

  const currentQ = filteredQuestions[currentIndex] || filteredQuestions[0] || PRACTICE_QUESTIONS[0];

  const handleSelectOption = (optId) => {
    if (submitted) return;
    setSelectedOption(optId);
  };

  const handleSubmitAnswer = async () => {
    if (!selectedOption || submitted) return;
    setSubmitting(true);

    const isCorrect = selectedOption.toUpperCase() === currentQ.correct_option.toUpperCase();
    const pointsAwarded = isCorrect ? 10 : 0;

    try {
      // Attempt backend record if available
      const res = await submitSimulatorAnswer(currentQ.id, selectedOption);
      setFeedback(res);
      setProfile(prev => ({
        ...prev,
        score: res.total_score,
        streak: res.streak,
        level: res.level,
        badges: res.badge_unlocked && !prev.badges.includes(res.badge_unlocked) 
          ? [...prev.badges, res.badge_unlocked] 
          : prev.badges
      }));
    } catch {
      // Immediate local evaluation fallback (zero interruption guarantee)
      const nextScore = profile.score + pointsAwarded;
      const nextStreak = isCorrect ? profile.streak + 1 : 0;
      let newBadge = null;
      if (nextScore >= 30 && !profile.badges.includes('Red Flag Hunter')) {
        newBadge = 'Red Flag Hunter';
      }
      let level = profile.level;
      if (nextScore >= 80) level = 'Master Fraud Sleuth';
      else if (nextScore >= 50) level = 'Senior Verifier';
      else if (nextScore >= 20) level = 'Apprentice Scout';

      setFeedback({
        correct: isCorrect,
        correct_option: currentQ.correct_option,
        explanation: currentQ.explanation,
        points: pointsAwarded,
        streak: nextStreak,
        total_score: nextScore,
        level,
        badge_unlocked: newBadge
      });

      setProfile(prev => ({
        ...prev,
        score: nextScore,
        streak: nextStreak,
        level,
        badges: newBadge ? [...prev.badges, newBadge] : prev.badges
      }));
    } finally {
      setSubmitted(true);
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setSubmitted(false);
      setFeedback(null);
    } else {
      alert('🎉 Congratulations! You have completed all interactive practice mode scenarios in this topic.');
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setSubmitted(false);
    setFeedback(null);
  };

  const handleTopicChange = (topic) => {
    setSelectedTopic(topic);
    setCurrentIndex(0);
    setSelectedOption(null);
    setSubmitted(false);
    setFeedback(null);
  };

  const progressPct = Math.round(((currentIndex + 1) / filteredQuestions.length) * 100);

  return (
    <div className="space-y-6 py-6 max-w-4xl mx-auto">
      {/* Header & Stats Banner */}
      <div className="bg-[#0B2E73] rounded-2xl text-white p-6 shadow-md border-t-2 border-[#FF9933] border-x border-b border-[#123A8C]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#FF9933]">
                Practice Mode • Spot the Red Flag
              </span>
            </div>
            <h1 className="text-2xl font-black text-white mt-1">
              Practice Mode
            </h1>
            <p className="text-xs text-blue-100/80 mt-0.5">
              Practice identifying scam signals, urgency &amp; FOMO, scarcity &amp; social proof, unsupported claims, and missing evidence.
            </p>
          </div>

          {/* Gamified counters */}
          <div className="flex items-center gap-3">
            <div className="bg-white/10 border border-white/20 px-3.5 py-2 rounded-xl text-center min-w-[70px]">
              <span className="text-[10px] font-bold uppercase text-blue-200 block">Score</span>
              <span className="text-lg font-black text-[#FF9933]">+{profile.score}</span>
            </div>
            <div className="bg-white/10 border border-white/20 px-3.5 py-2 rounded-xl text-center min-w-[70px]">
              <div className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase text-blue-200">
                <Flame className="w-3 h-3 text-[#FF9933] fill-current" />
                <span>Streak</span>
              </div>
              <span className="text-lg font-black text-[#FF9933]">{profile.streak}🔥</span>
            </div>
            <div className="bg-white/10 border border-white/20 px-3.5 py-2 rounded-xl text-center">
              <span className="text-[10px] font-bold uppercase text-blue-200 block">Level</span>
              <span className="text-xs font-black text-white whitespace-nowrap">{profile.level}</span>
            </div>
          </div>
        </div>

        {/* Practice Topics Filter Bar */}
        <div className="mt-5 pt-4 border-t border-white/10">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Filter className="w-3 h-3 text-blue-400" />
            <span>Practice Areas:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PRACTICE_TOPICS.map((topic) => {
              const isActive = selectedTopic === topic;
              return (
                <button
                  key={topic}
                  type="button"
                  onClick={() => handleTopicChange(topic)}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#123A8C] border-white text-white font-bold shadow-xs'
                      : 'bg-white/10 hover:bg-white/20 border-white/20 text-blue-100/90'
                  }`}
                >
                  {topic}
                </button>
              );
            })}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-blue-100/80 mb-1.5">
          <span>Scenario {currentIndex + 1} of {filteredQuestions.length}</span>
          <span className="font-mono font-bold text-[#FF9933]">{progressPct}% Complete</span>
        </div>
        <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
          <div className="bg-[#FF9933] h-full rounded-full transition-all duration-300" style={{ width: `${progressPct}%` }}></div>
        </div>
      </div>

      {/* Badges Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center justify-between flex-wrap gap-2 text-xs">
        <span className="font-bold text-slate-700 flex items-center gap-1.5">
          <Trophy className="w-4 h-4 text-amber-500" />
          <span>Earned Badges:</span>
        </span>
        <div className="flex items-center gap-2 flex-wrap">
          {['First Analysis', 'Red Flag Hunter', 'Evidence Seeker', 'Smart Verifier'].map((badge) => {
            const isUnlocked = profile.badges.includes(badge);
            return (
              <span
                key={badge}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                  isUnlocked
                    ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-sm'
                    : 'bg-slate-100 text-slate-400 border border-slate-200 opacity-60'
                }`}
              >
                <Star className={`w-3 h-3 ${isUnlocked ? 'text-amber-600 fill-current' : 'text-slate-400'}`} />
                <span>{badge}</span>
              </span>
            );
          })}
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
        {/* Fictional Message Mockup */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs font-bold text-slate-700">{currentQ.author}</span>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full uppercase">
              {currentQ.category || currentQ.topic}
            </span>
          </div>
          <p className="text-sm font-semibold text-slate-900 italic font-serif">
            "{currentQ.post_text}"
          </p>
        </div>

        {/* Short Interactive Question */}
        <div>
          <h3 className="text-base font-bold text-slate-900">
            {currentQ.question}
          </h3>
        </div>

        {/* Options A, B, C, D */}
        <div className="space-y-2.5">
          {currentQ.options.map((opt) => {
            const isSelected = selectedOption === opt.id;
            let optStyle = 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800';

            if (submitted) {
              if (opt.id === currentQ.correct_option) {
                optStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold ring-2 ring-emerald-200';
              } else if (isSelected && opt.id !== currentQ.correct_option) {
                optStyle = 'bg-rose-50 border-rose-400 text-rose-900 line-through';
              } else {
                optStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
              }
            } else if (isSelected) {
              optStyle = 'bg-blue-50 border-blue-500 text-blue-900 font-bold ring-2 ring-blue-100';
            }

            return (
              <button
                key={opt.id}
                onClick={() => handleSelectOption(opt.id)}
                disabled={submitted}
                className={`w-full text-left p-3.5 rounded-lg border text-xs sm:text-sm transition-all flex items-center justify-between cursor-pointer ${optStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-mono font-bold flex items-center justify-center text-xs flex-shrink-0">
                    {opt.id}
                  </span>
                  <span>{opt.text}</span>
                </div>
                {submitted && opt.id === currentQ.correct_option && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                )}
                {submitted && isSelected && opt.id !== currentQ.correct_option && (
                  <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback Rationale Box with Correct Answer & Brief Explanation */}
        {submitted && feedback && (
          <div className={`p-4 rounded-xl border text-xs sm:text-sm animate-in fade-in duration-200 ${
            feedback.correct ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-rose-50 border-rose-300 text-rose-900'
          }`}>
            <div className="flex items-center justify-between mb-1.5 font-bold">
              <span className="flex items-center gap-1.5">
                {feedback.correct ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Correct Answer! (+{feedback.points} Points)</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span>Incorrect Choice • Correct Answer: Option {feedback.correct_option}</span>
                  </>
                )}
              </span>
              {feedback.badge_unlocked && (
                <span className="text-xs bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-bold">
                  🎉 New Badge: {feedback.badge_unlocked}!
                </span>
              )}
            </div>
            <p className="text-xs leading-relaxed text-slate-700 mt-1">
              <strong>Official Explanation:</strong> {feedback.explanation}
            </p>
          </div>
        )}

        {/* Buttons: Submit or Next */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 font-medium cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restart Practice</span>
          </button>

          {!submitted ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={!selectedOption || submitting}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              {submitting ? 'Checking...' : 'Submit Answer'}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              <span>{currentIndex < filteredQuestions.length - 1 ? 'Next Scenario' : 'Finish Practice'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
