import React, { useState, useEffect } from 'react';
import { 
  Award, Flame, Trophy, CheckCircle2, XCircle, ArrowRight, 
  RotateCcw, Sparkles, ShieldAlert, Star, ShieldCheck, ChevronRight 
} from 'lucide-react';
import { fetchSimulatorQuestions, submitSimulatorAnswer, fetchSimulatorProfile } from '../services/api';

export default function SimulatorPage() {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [profile, setProfile] = useState({ score: 0, streak: 0, level: 'Novice Detective', badges: [] });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([fetchSimulatorQuestions(), fetchSimulatorProfile()])
      .then(([qData, pData]) => {
        setQuestions(qData);
        setProfile(pData);
      })
      .catch(err => console.error('Failed to load simulator data:', err))
      .finally(() => setLoading(false));
  }, []);

  const currentQ = questions[currentIndex];

  const handleSelectOption = (optId) => {
    if (submitted) return;
    setSelectedOption(optId);
  };

  const handleSubmitAnswer = async () => {
    if (!selectedOption || submitted) return;
    setSubmitting(true);

    try {
      const res = await submitSimulatorAnswer(currentQ.id, selectedOption);
      setFeedback(res);
      setSubmitted(true);
      setProfile(prev => ({
        ...prev,
        score: res.total_score,
        streak: res.streak,
        level: res.level,
        badges: res.badge_unlocked && !prev.badges.includes(res.badge_unlocked) 
          ? [...prev.badges, res.badge_unlocked] 
          : prev.badges
      }));
    } catch (err) {
      alert('Error submitting answer: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setSubmitted(false);
      setFeedback(null);
    } else {
      // Completed all questions
      alert('Congratulations! You completed all simulator training scenarios!');
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setSubmitted(false);
    setFeedback(null);
  };

  if (loading || !currentQ) {
    return (
      <div className="py-16 text-center text-slate-500">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs">Loading simulator scenarios...</p>
      </div>
    );
  }

  const progressPct = Math.round(((currentIndex + 1) / questions.length) * 100);

  return (
    <div className="space-y-6 py-6 max-w-4xl mx-auto">
      {/* Header & Stats Banner */}
      <div className="bg-slate-900 rounded-2xl text-white p-6 shadow-lg border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Gamified Financial Literacy</span>
            </div>
            <h1 className="text-2xl font-black text-white mt-1">Spot the Red Flag</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Sharpen your retail investor instincts by identifying manipulation patterns, misleading returns, and disclosure gaps.
            </p>
          </div>

          {/* Gamified counters */}
          <div className="flex items-center gap-3">
            <div className="bg-slate-800/90 border border-slate-700 px-3.5 py-2 rounded-xl text-center min-w-[70px]">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Score</span>
              <span className="text-lg font-black text-amber-400">+{profile.score}</span>
            </div>
            <div className="bg-slate-800/90 border border-slate-700 px-3.5 py-2 rounded-xl text-center min-w-[70px]">
              <div className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase text-slate-400">
                <Flame className="w-3 h-3 text-orange-500 fill-current" />
                <span>Streak</span>
              </div>
              <span className="text-lg font-black text-orange-400">{profile.streak}🔥</span>
            </div>
            <div className="bg-slate-800/90 border border-slate-700 px-3.5 py-2 rounded-xl text-center">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Level</span>
              <span className="text-xs font-black text-blue-400 whitespace-nowrap">{profile.level}</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 mb-1.5">
          <span>Scenario {currentIndex + 1} of {questions.length}</span>
          <span className="font-mono font-bold text-blue-400">{progressPct}% Complete</span>
        </div>
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
          <div className="bg-blue-500 h-full rounded-full transition-all duration-300" style={{ width: `${progressPct}%` }}></div>
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
        {/* Post Mockup */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs font-bold text-slate-700">{currentQ.author}</span>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full uppercase">
              {currentQ.category}
            </span>
          </div>
          <p className="text-sm font-semibold text-slate-900 italic font-serif">
            "{currentQ.post_text}"
          </p>
        </div>

        {/* Question Prompt */}
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
                className={`w-full text-left p-3.5 rounded-lg border text-xs sm:text-sm transition-all flex items-center justify-between ${optStyle}`}
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

        {/* Feedback Rationale Box */}
        {submitted && feedback && (
          <div className={`p-4 rounded-xl border text-xs sm:text-sm animate-in fade-in duration-200 ${
            feedback.correct ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-rose-50 border-rose-300 text-rose-900'
          }`}>
            <div className="flex items-center justify-between mb-1.5 font-bold">
              <span className="flex items-center gap-1.5">
                {feedback.correct ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Correct Reasoning! (+{feedback.points} Points)</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span>Incorrect Choice</span>
                  </>
                )}
              </span>
              {feedback.badge_unlocked && (
                <span className="text-xs bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-bold">
                  🎉 New Badge: {feedback.badge_unlocked}!
                </span>
              )}
            </div>
            <p className="text-xs leading-relaxed text-slate-700">
              {feedback.explanation}
            </p>
          </div>
        )}

        {/* Buttons: Submit or Next */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restart Quiz</span>
          </button>

          {!submitted ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={!selectedOption || submitting}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
            >
              {submitting ? 'Checking...' : 'Submit Answer'}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
            >
              <span>{currentIndex < questions.length - 1 ? 'Next Scenario' : 'Finish'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
