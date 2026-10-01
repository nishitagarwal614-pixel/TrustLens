import React from 'react';
import { Shield, Search, History, Award, AlertTriangle, Settings } from 'lucide-react';

export default function Navbar({ activePage, setActivePage, onTriggerDemo }) {
  const navItems = [
    { id: 'analyze', label: 'Analyze Content', icon: Search },
    { id: 'history', label: 'Verification History', icon: History },
    { id: 'simulator', label: 'Financial Literacy', icon: Award },
    { id: 'reports', label: 'Reports', icon: AlertTriangle },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Home Link */}
          <div 
            className="flex items-center gap-2 cursor-pointer select-none group transition-opacity hover:opacity-90"
            onClick={() => setActivePage('landing')}
            title="TrustLens AI - Home"
          >
            <div className="p-2 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 group-hover:border-blue-400/60 transition-colors">
              <Shield className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-white group-hover:text-blue-100 transition-colors">TrustLens</span>
              <span className="text-blue-400 font-bold ml-1 text-sm bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-800/60">AI</span>
            </div>
          </div>

          {/* Nav links */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile navigation bar */}
      <div className="lg:hidden border-t border-slate-800 px-3 py-2 overflow-x-auto flex justify-between items-center gap-2 bg-slate-900/95 scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors ${
                isActive ? 'bg-blue-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
