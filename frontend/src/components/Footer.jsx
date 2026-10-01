import React from 'react';
import { Shield, ExternalLink, CheckCircle } from 'lucide-react';

export default function Footer({ onNavigate }) {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-xs mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <Shield className="w-5 h-5 text-blue-400" />
              <span>TrustLens AI</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              AI-powered financial content verification and retail-investor protection platform.
              Detects unverified return guarantees, urgency tactics, hidden affiliate funnels, and conflicts with official stock exchange filings.
            </p>
            <div className="flex items-center gap-2 text-emerald-400 text-[11px] font-medium pt-1">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Demo Mode Active • Local Document Knowledge Base Indexed</span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">Verification Tools</h4>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => onNavigate('analyze')} className="hover:text-white transition-colors">Analyze Financial Post</button></li>
              <li><button onClick={() => onNavigate('creators')} className="hover:text-white transition-colors">Creator Transparency Profiles</button></li>
              <li><button onClick={() => onNavigate('simulator')} className="hover:text-white transition-colors">Red Flag Simulator</button></li>
            </ul>
          </div>

          {/* Regulatory Guidance Links */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">Statutory Portals</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="https://scores.sebi.gov.in" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-white transition-colors">
                  <span>SEBI SCORES 2.0</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href="https://cybercrime.gov.in" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-white transition-colors">
                  <span>National Cyber Crime</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href="https://www.nseindia.com" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-white transition-colors">
                  <span>NSE Corporate Filings</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <button onClick={() => onNavigate('reports')} className="hover:text-white transition-colors">Submit Community Report</button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom mandatory disclaimer */}
        <div className="pt-6 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p className="leading-relaxed text-center md:text-left">
            <strong>Disclaimer:</strong> TrustLens AI provides informational verification and financial-literacy assistance. It does not provide investment advice or guarantee the accuracy of market outcomes. Never base investment decisions solely on automated tool outputs.
          </p>
          <div className="flex-shrink-0 text-slate-400">
            <span>TrustLens AI © 2025 • Hackathon Edition</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
