import React, { useState, useRef, useEffect } from 'react';
import { Shield, Search, History, Award, AlertTriangle, Settings, Globe, User, ChevronDown, Check, X } from 'lucide-react';
import { useLanguage, SUPPORTED_LANGUAGES } from '../context/LanguageContext';

export default function Navbar({ activePage, setActivePage, onTriggerDemo }) {
  const { t, language, setLanguage, userSession } = useLanguage();
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isMobileLangOpen, setIsMobileLangOpen] = useState(false);
  const langMenuRef = useRef(null);

  // Close desktop dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target)) {
        setIsLangMenuOpen(false);
      }
    }
    if (isLangMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isLangMenuOpen]);

  const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.id === language) || SUPPORTED_LANGUAGES[0];

  const navItems = [
    { id: 'analyze', label: t?.nav?.analyze || 'Analyze Content', icon: Search },
    { id: 'history', label: t?.nav?.history || 'Verification History', icon: History },
    { id: 'simulator', label: t?.nav?.simulator || 'Practice Mode', icon: Award },
    { id: 'reports', label: t?.nav?.reports || 'Reports', icon: AlertTriangle },
    { id: 'settings', label: t?.nav?.settings || 'Settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0B2E73] text-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Home Link */}
          <div 
            className="flex items-center gap-2.5 cursor-pointer select-none group transition-all"
            onClick={() => setActivePage('landing')}
            title="सतर्क SIGHT - Home"
          >
            <img 
              src="/satark-sight-white.png" 
              alt="सतर्क SIGHT" 
              className="h-10 w-auto object-contain transition-transform group-hover:scale-102 drop-shadow-xs"
            />
            <span className="text-white font-bold text-xs bg-[#4635B1] px-1.5 py-0.5 rounded border border-[#4635B1] shadow-2xs self-center">
              AI
            </span>
          </div>

          {/* Right Section: Nav links + Language / Profile Button */}
          <div className="hidden lg:flex items-center gap-4 xl:gap-6">
            <nav className="flex items-center gap-2 xl:gap-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActivePage(item.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#123A8C] text-white shadow-xs font-semibold ring-1 ring-white/20'
                        : 'text-blue-100/90 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Language & Profile Quick Switcher with Interactive Popover */}
            <div className="relative" ref={langMenuRef}>
              <button
                type="button"
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-medium transition-all cursor-pointer ${
                  isLangMenuOpen
                    ? 'bg-[#123A8C] text-white border-white/40 shadow-sm ring-2 ring-white/20'
                    : 'bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/40'
                }`}
                title="Click to switch language or profile"
                aria-label="Language and profile menu"
                aria-expanded={isLangMenuOpen}
              >
                <Globe className={`w-3.5 h-3.5 ${isLangMenuOpen ? 'text-white' : 'text-blue-300'}`} />
                <span className="font-semibold">
                  {currentLangObj.native}
                </span>
                <span className={`w-1 h-1 rounded-full ${isLangMenuOpen ? 'bg-white' : 'bg-[#FF9933]'}`} />
                <span className={`flex items-center gap-1 ${isLangMenuOpen ? 'text-blue-100' : 'text-blue-100/80'}`}>
                  <User className="w-3 h-3" />
                  {userSession?.mode === 'profile' ? (userSession.name || t?.nav?.profile || 'Profile') : (t?.nav?.guest || 'Guest')}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isLangMenuOpen ? 'rotate-180 text-white' : 'text-blue-200/80'}`} />
              </button>

              {/* Desktop Language Popover Menu */}
              {isLangMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-[#D8DEE8] rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-[#172033]">
                  <div className="px-3.5 py-1.5 border-b border-[#D8DEE8] text-[11px] font-semibold text-[#4B5563] uppercase tracking-wider flex items-center gap-1.5">
                    <Globe className="w-3 h-3 text-[#123A8C]" />
                    <span>Choose Language / भाषा चुनें</span>
                  </div>

                  <div className="p-1.5 space-y-1">
                    {SUPPORTED_LANGUAGES.map((lang) => {
                      const isSelected = language === lang.id;
                      return (
                        <button
                          key={lang.id}
                          type="button"
                          onClick={() => {
                            setLanguage(lang.id);
                            setIsLangMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-[#123A8C] text-white font-bold shadow-xs'
                              : 'text-[#172033] hover:bg-[#EEF3FB] hover:text-[#123A8C]'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-base">{lang.flag}</span>
                            <span className="text-sm font-semibold">{lang.native}</span>
                            <span className={`text-[11px] ${isSelected ? 'text-blue-100' : 'text-[#6B7280]'}`}>
                              ({lang.name})
                            </span>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-white" />}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-1 pt-1.5 border-t border-[#D8DEE8] px-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setIsLangMenuOpen(false);
                        setActivePage('welcome');
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-[#123A8C] hover:text-[#0B2E73] hover:bg-[#EEF3FB] transition-colors cursor-pointer font-medium"
                    >
                      <span className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" />
                        {userSession?.mode === 'profile' ? 'Change Profile Settings' : 'Create Profile / Guest Settings'}
                      </span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile navigation bar */}
      <div className="lg:hidden border-t border-white/10 px-3 py-2 overflow-x-auto flex items-center gap-2 bg-[#0B2E73] text-white scrollbar-none">
        {/* Mobile Language / Profile Button */}
        <button
          type="button"
          onClick={() => setIsMobileLangOpen(true)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors border cursor-pointer ${
            isMobileLangOpen 
              ? 'bg-[#123A8C] text-white border-white/40 font-semibold' 
              : 'bg-white/10 text-white border-white/20'
          }`}
          title="Switch Language or Profile"
        >
          <Globe className="w-3.5 h-3.5 text-blue-300" />
          <span>{currentLangObj.native}</span>
          <ChevronDown className="w-3 h-3 text-blue-200" />
        </button>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors ${
                isActive ? 'bg-[#123A8C] text-white font-semibold' : 'text-blue-100 hover:bg-white/10'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Mobile Language Modal / Sheet */}
      {isMobileLangOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B2E73]/70 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white border border-[#D8DEE8] rounded-3xl shadow-2xl p-4 space-y-3 animate-in fade-in zoom-in-95 duration-150 text-[#172033]">
            <div className="flex items-center justify-between pb-2 border-b border-[#D8DEE8]">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#123A8C]" />
                <span className="font-bold text-sm text-[#0B2E73]">Choose Language / भाषा चुनें</span>
              </div>
              <button 
                type="button"
                onClick={() => setIsMobileLangOpen(false)} 
                className="p-1 rounded-lg text-[#4B5563] hover:text-[#172033] cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {SUPPORTED_LANGUAGES.map((lang) => {
                const isSelected = language === lang.id;
                return (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => {
                      setLanguage(lang.id);
                      setIsMobileLangOpen(false);
                    }}
                    className={`p-3 rounded-2xl flex flex-col items-center justify-center text-center gap-1 border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#123A8C] border-[#123A8C] text-white font-bold ring-2 ring-blue-200'
                        : 'bg-[#F5F6F8] border-[#D8DEE8] text-[#172033] hover:bg-[#EEF3FB]'
                    }`}
                  >
                    <span className="text-xl">{lang.flag}</span>
                    <span className="text-sm font-semibold">{lang.native}</span>
                    <span className={`text-[10px] ${isSelected ? 'text-blue-100' : 'text-[#6B7280]'}`}>
                      {lang.name}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-[#D8DEE8]">
              <button
                type="button"
                onClick={() => {
                  setIsMobileLangOpen(false);
                  setActivePage('welcome');
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-[#EEF3FB] hover:bg-[#D6E3F6] text-[#123A8C] text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer border border-[#B8CBE8]"
              >
                <User className="w-4 h-4" />
                <span>Switch Profile / Welcome Page →</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Indian Identity Tricolor Accent Line matching reference screenshot */}
      <div className="grid grid-cols-2 h-1 w-full">
        <div className="bg-[#FF9933]" />
        <div className="bg-[#138808]" />
      </div>
    </header>
  );
}
