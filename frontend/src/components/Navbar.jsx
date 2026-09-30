import React from 'react';
import { Shield, BarChart3, Search, History, Users, Award, AlertTriangle, Settings, Zap } from 'lucide-react';

export default function Navbar({ activePage, setActivePage, onTriggerDemo }) {
  const navItems = [
    { id: 'landing', label: 'Home', icon: Shield },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'analyze', label: 'Analyze Content', icon: Search },
    { id: 'history', label: 'Verification History', icon: History },
    { id: 'creators', label: 'Creator Profiles', icon: Users },
    { id: 'simulator', label: 'Financial Literacy', icon: Award },
    { id: 'reports', label: 'Reports', icon: AlertTriangle },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer select-none"
            onClick={() => setActivePage('landing')}
          >
            <div className="p-2 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400">
              <Shield className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-white">TrustLens</span>
              <span className="text-blue-400 font-bold ml-1 text-sm bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-800/60">AI</span>
            </div>
          </div>

          {/* Nav links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Quick Demo Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={onTriggerDemo}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm transition-all hover:scale-105 active:scale-95"
              title="Instantly run analysis on sample high-risk post"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Try Demo Analysis</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation bar */}
      <div className="lg:hidden border-t border-slate-800 px-2 py-2 overflow-x-auto flex space-x-1 bg-slate-900/95 scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded text-xs whitespace-nowrap ${
                isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
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
