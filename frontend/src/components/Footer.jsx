import React from 'react';
import { Shield, ExternalLink, CheckCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Footer({ onNavigate }) {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#0B2E73] border-t-2 border-[#FF9933] text-blue-100/80 text-xs mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <img 
                src="/satark-sight-white.png" 
                alt="सतर्क SIGHT" 
                className="h-8 w-auto object-contain"
              />
              <span className="text-white font-bold text-xs bg-[#4635B1] px-1.5 py-0.5 rounded border border-[#4635B1]">
                AI
              </span>
            </div>
            <p className="text-blue-100/75 text-xs leading-relaxed max-w-md">
              {t?.footer?.about || 'AI-powered financial content verification and retail-investor protection platform.'}
            </p>
            <div className="flex items-center gap-2 text-[#138808] bg-white/95 px-2.5 py-1 rounded-md text-[11px] font-medium pt-1 w-fit shadow-xs">
              <CheckCircle className="w-3.5 h-3.5 text-[#138808]" />
              <span className="text-[#172033] font-semibold">SEBI &amp; RBI Guidelines • NSE &amp; BSE Filings Verified</span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">
              {t?.footer?.tools || 'Verification Tools'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => onNavigate('analyze')} className="hover:text-white transition-colors cursor-pointer">{t?.nav?.analyze || 'Analyze Financial Post'}</button></li>
              <li><button onClick={() => onNavigate('simulator')} className="hover:text-white transition-colors cursor-pointer">{t?.nav?.simulator || 'Red Flag Simulator'}</button></li>
              <li><button onClick={() => onNavigate('reports')} className="hover:text-white transition-colors cursor-pointer">{t?.nav?.reports || 'Submit Community Report'}</button></li>
              <li><button onClick={() => onNavigate('welcome')} className="hover:text-blue-300 text-blue-400 font-medium transition-colors cursor-pointer">🌐 {t?.footer?.langSetup || 'Language & Profile Setup'}</button></li>
            </ul>
          </div>

          {/* Regulatory Guidance Links */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">
              {t?.footer?.statutory || 'Statutory Portals'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="https://scores.sebi.gov.in" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-white transition-colors">
                  <span>{t?.footer?.sebiScores || 'SEBI SCORES 2.0'}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href="https://cybercrime.gov.in" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-white transition-colors">
                  <span>{t?.footer?.cyberCrime || 'National Cyber Crime'}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href="https://www.nseindia.com" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-white transition-colors">
                  <span>{t?.footer?.nseFilings || 'NSE Corporate Filings'}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-white/10 text-center text-blue-200/60 text-[11px]">
          <p>{t?.footer?.copyright || 'सतर्क SIGHT AI • Built for retail investor safety. Not financial advice.'}</p>
        </div>
      </div>
    </footer>
  );
}
