import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function DisclaimerBanner() {
  const { t } = useLanguage();

  return (
    <div className="bg-[#FFF9F9] border-b border-[#F3B6BA]/60 text-[#4B5563] px-4 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-[#ED1C24] text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0">
            !
          </div>
          <span className="text-[11px] sm:text-xs">
            <strong className="text-[#ED1C24] font-bold tracking-tight">{t?.banner?.label || 'LEGAL & REGULATORY NOTICE'}:</strong>{' '}
            <span>{t?.banner?.text || 'सतर्क SIGHT AI is an informational forensic verification and financial literacy tool. It does NOT provide investment advice, buy/sell calls, or securities ratings. Always consult a SEBI-registered financial advisor.'}</span>
          </span>
        </div>
        <span className="hidden sm:inline-flex items-center text-[10px] font-bold text-[#8C4A00] uppercase tracking-wider bg-[#FFECC8] border border-[#F6D8A8] px-2.5 py-1 rounded-md flex-shrink-0 shadow-2xs">
          SEBI / RBI
        </span>
      </div>
    </div>
  );
}
