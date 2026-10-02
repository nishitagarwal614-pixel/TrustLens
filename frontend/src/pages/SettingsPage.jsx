import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  ShieldCheck, 
  CheckCircle2, 
  Bell, 
  Save, 
  Lock, 
  Camera, 
  Key, 
  RefreshCw, 
  Sliders, 
  Shield, 
  BadgeCheck, 
  AlertCircle,
  ExternalLink,
  Smartphone,
  Eye,
  EyeOff
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function SettingsPage() {
  const { t } = useLanguage();
  const defaultProfile = {
    fullName: '',
    email: '',
    phone: '',
    investorType: 'Retail Investor',
    marketFocus: 'Equities (NSE/BSE) & Mutual Funds',
    location: '',
    bio: ''
  };

  const defaultPreferences = {
    defaultScanMode: 'photo',
    highRiskAlerts: true,
    unregisteredAdvisorWarning: true,
    autoExtractClaims: true,
    weeklyFraudDigest: false,
    saveScanHistory: true
  };

  // State initialized from localStorage or clean defaults
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('trustlens_user_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Clear any old demo data automatically
        if (parsed.fullName === 'Nishita Agarwal' || parsed.accountId === 'TL-84920') {
          localStorage.removeItem('trustlens_user_profile');
          return defaultProfile;
        }
        return { ...defaultProfile, ...parsed };
      }
      return defaultProfile;
    } catch {
      return defaultProfile;
    }
  });

  const [preferences, setPreferences] = useState(() => {
    try {
      const saved = localStorage.getItem('trustlens_user_preferences');
      return saved ? JSON.parse(saved) : defaultPreferences;
    } catch {
      return defaultPreferences;
    }
  });

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'preferences' | 'security'
  const [saveSuccess, setSaveSuccess] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(null);

  // Security password state
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });

  // Handle profile input change
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  // Handle preferences toggle
  const handlePrefToggle = (key) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Handle preferences select
  const handlePrefChange = (key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  // Save profile & preferences to localStorage
  const handleSave = (e) => {
    if (e) e.preventDefault();
    localStorage.setItem('trustlens_user_profile', JSON.stringify(profile));
    localStorage.setItem('trustlens_user_preferences', JSON.stringify(preferences));
    setSaveSuccess('Your profile details and preferences have been updated successfully.');
    setTimeout(() => setSaveSuccess(''), 4000);
  };

  // Clear fields
  const handleReset = () => {
    if (window.confirm('Clear all profile details?')) {
      setProfile(defaultProfile);
      setAvatarUrl(null);
      localStorage.removeItem('trustlens_user_profile');
      setSaveSuccess('Profile details cleared.');
      setTimeout(() => setSaveSuccess(''), 3000);
    }
  };

  // Avatar upload simulation
  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setAvatarUrl(uploadEvent.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Password update handler
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!passwords.current || !passwords.newPass || !passwords.confirm) {
      setPasswordMsg({ type: 'error', text: 'Please fill in all password fields.' });
      return;
    }
    if (passwords.newPass.length < 8) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 8 characters long.' });
      return;
    }
    if (passwords.newPass !== passwords.confirm) {
      setPasswordMsg({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }
    setPasswordMsg({ type: 'success', text: 'Password changed successfully.' });
    setPasswords({ current: '', newPass: '', confirm: '' });
    setTimeout(() => setPasswordMsg({ type: '', text: '' }), 4000);
  };

  return (
    <div className="space-y-6 py-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {t?.settings?.title || 'Profile & Account Settings'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {t?.settings?.subtitle || 'Manage your personal investor details, verification preferences, alert configurations, and security settings.'}
            </p>
          </div>
        </div>
      </div>

      {/* Save Success Alert */}
      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-medium flex items-center gap-2 shadow-sm animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {/* Tabs navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <User className="w-4 h-4" />
          <span>{t?.settings?.tabProfile || 'Profile Details'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('preferences')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'preferences'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>{t?.settings?.tabAlerts || 'Verification & Alerts'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'security'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>{t?.settings?.tabSecurity || 'Security & Login'}</span>
        </button>
      </div>

      {/* ========================================================
          TAB 1: PROFILE DETAILS
          ======================================================== */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Profile Overview Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar & Photo changer */}
            <div className="relative group">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-slate-100 to-slate-200 text-slate-700 font-extrabold text-2xl flex items-center justify-center shadow-inner overflow-hidden border-2 border-white ring-2 ring-slate-200">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="User Avatar" className="w-full h-full object-cover" />
                ) : profile.fullName ? (
                  <span className="text-blue-600 font-black">
                    {profile.fullName.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </span>
                ) : (
                  <User className="w-9 h-9 text-slate-400" />
                )}
              </div>
              <label 
                htmlFor="avatar-upload" 
                className="absolute -bottom-1.5 -right-1.5 p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md cursor-pointer border border-white transition-transform group-hover:scale-105"
                title="Upload Profile Picture"
              >
                <Camera className="w-3.5 h-3.5" />
                <input 
                  id="avatar-upload" 
                  type="file" 
                  accept="image/*" 
                  onChange={handleAvatarUpload} 
                  className="hidden" 
                />
              </label>
            </div>

            {/* Profile Summary */}
            <div className="flex-1 text-center sm:text-left space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl font-bold text-slate-900">
                  {profile.fullName || 'Investor Profile'}
                </h2>
                {profile.fullName && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Verified
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-500 font-medium">
                {profile.email ? profile.email : 'No email address registered'} {profile.phone ? `• ${profile.phone}` : ''}
              </p>
              
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2">
                <span className="text-[11px] px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-semibold border border-blue-100">
                  {profile.investorType || 'Retail Investor'}
                </span>
                {profile.location && (
                  <span className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium">
                    {profile.location}
                  </span>
                )}
                {profile.marketFocus && (
                  <span className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium">
                    {profile.marketFocus}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Detailed Profile Edit Form */}
          <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Personal & Financial Information</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Update your contact details and investor classification used for verification reports.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
              {/* Full Name */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    name="fullName"
                    value={profile.fullName}
                    onChange={handleProfileChange}
                    className="w-full pl-9 pr-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-medium"
                    placeholder="Enter your full name"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleProfileChange}
                    className="w-full pl-9 pr-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-medium"
                    placeholder="Enter your email address"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Phone Number</label>
                <div className="relative">
                  <input
                    type="tel"
                    name="phone"
                    value={profile.phone}
                    onChange={handleProfileChange}
                    className="w-full pl-9 pr-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-medium"
                    placeholder="+91 Mobile number"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Location / City & State</label>
                <div className="relative">
                  <input
                    type="text"
                    name="location"
                    value={profile.location}
                    onChange={handleProfileChange}
                    className="w-full pl-9 pr-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-medium"
                    placeholder="City, State, Country"
                  />
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              {/* Investor Classification */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Investor Classification</label>
                <select
                  name="investorType"
                  value={profile.investorType}
                  onChange={handleProfileChange}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-medium"
                >
                  <option value="Retail Investor">Retail Investor</option>
                  <option value="High Net-Worth Individual (HNI)">High Net-Worth Individual (HNI)</option>
                  <option value="SEBI Registered Research Analyst (RA)">SEBI Registered Research Analyst (RA)</option>
                  <option value="Investment Advisor (RIA)">Investment Advisor (RIA)</option>
                  <option value="Financial Content Creator / Educator">Financial Content Creator / Educator</option>
                  <option value="Student / Market Learner">Student / Market Learner</option>
                </select>
              </div>

              {/* Market Focus */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Primary Investment Focus</label>
                <select
                  name="marketFocus"
                  value={profile.marketFocus}
                  onChange={handleProfileChange}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-medium"
                >
                  <option value="Equities (NSE/BSE) & Mutual Funds">Equities (NSE/BSE) & Mutual Funds</option>
                  <option value="Derivatives (F&O) & Day Trading">Derivatives (F&O) & Day Trading</option>
                  <option value="Fixed Income & Sovereign Gold Bonds">Fixed Income & Sovereign Gold Bonds</option>
                  <option value="Commodities & Currency">Commodities & Currency</option>
                  <option value="All Financial Instruments">All Financial Instruments</option>
                </select>
              </div>

              {/* Bio / Description */}
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1.5">Investor Bio / Mission</label>
                <textarea
                  name="bio"
                  rows={3}
                  value={profile.bio}
                  onChange={handleProfileChange}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-medium leading-relaxed"
                  placeholder="Add a brief bio, research focus, or investment philosophy..."
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Clear Fields</span>
              </button>

              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================
          TAB 2: VERIFICATION & ALERTS PREFERENCES
          ======================================================== */}
      {activeTab === 'preferences' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Verification Engine Defaults</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Customize how सतर्क SIGHT AI checks and flags potential financial fraud.
              </p>
            </div>

            {/* Default Scanner Mode */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800">Default Scanner Mode on Home Page</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'photo', label: 'Scan Photo', desc: 'Camera capture & image OCR' },
                  { id: 'text', label: 'Check Text', desc: 'Direct message & post inspection' },
                  { id: 'link', label: 'Check Link', desc: 'URL and social link analysis' },
                ].map((mode) => (
                  <div
                    key={mode.id}
                    onClick={() => handlePrefChange('defaultScanMode', mode.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      preferences.defaultScanMode === mode.id
                        ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{mode.label}</span>
                      <input 
                        type="radio" 
                        name="scanMode" 
                        checked={preferences.defaultScanMode === mode.id}
                        onChange={() => {}} 
                        className="text-blue-600"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">{mode.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Toggle Preferences */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Automated Vigilance Toggles</h4>

              {/* High Risk Alert */}
              <div className="flex items-start justify-between gap-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-900">Prominent High-Risk Warning Banners</span>
                  <p className="text-[11px] text-slate-500">
                    Instantly display warning banners when claims promise guaranteed returns above 15% or pressure urgent actions.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handlePrefToggle('highRiskAlerts')}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    preferences.highRiskAlerts ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      preferences.highRiskAlerts ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* SEBI Registration Warning */}
              <div className="flex items-start justify-between gap-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-900">Unregistered Finfluencer Warnings</span>
                  <p className="text-[11px] text-slate-500">
                    Flag posts that offer specific stock tips without displaying a verified SEBI RA/RIA registration number.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handlePrefToggle('unregisteredAdvisorWarning')}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    preferences.unregisteredAdvisorWarning ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      preferences.unregisteredAdvisorWarning ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Save History */}
              <div className="flex items-start justify-between gap-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-900">Record Verification History Locally</span>
                  <p className="text-[11px] text-slate-500">
                    Store past analyzed items in your Verification History for later audit and export.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handlePrefToggle('saveScanHistory')}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    preferences.saveScanHistory ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      preferences.saveScanHistory ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Weekly Fraud Digest */}
              <div className="flex items-start justify-between gap-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-900">Investor Safety Email Digest</span>
                  <p className="text-[11px] text-slate-500">
                    Receive weekly intelligence briefs highlighting newly detected Telegram pump schemes and counterfeit IPO groups.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handlePrefToggle('weeklyFraudDigest')}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    preferences.weeklyFraudDigest ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      preferences.weeklyFraudDigest ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleSave}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Save Preference Settings</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 3: SECURITY & LOGIN
          ======================================================== */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* Security Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Two-Factor Authentication</span>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-sm font-bold text-slate-900">Protected & Active</span>
              </div>
              <p className="text-[11px] text-slate-500">
                OTP verification is required whenever logging in from an unrecognized device or browser.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Active Session</span>
                <Smartphone className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-sm font-bold text-slate-900">Current Device • Online</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Windows PC • सतर्क SIGHT Desktop Client • Session initiated today
              </p>
            </div>
          </div>

          {/* Change Password Form */}
          <form onSubmit={handlePasswordSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Update Account Password</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Ensure your account is protected with a secure password containing numbers and symbols.
              </p>
            </div>

            {passwordMsg.text && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                passwordMsg.type === 'success' 
                  ? 'bg-emerald-50 border border-emerald-300 text-emerald-900' 
                  : 'bg-rose-50 border border-rose-300 text-rose-900'
              }`}>
                {passwordMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                )}
                <span>{passwordMsg.text}</span>
              </div>
            )}

            <div className="space-y-4 max-w-md text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Current Password *</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={passwords.current}
                    onChange={(e) => setPasswords(p => ({ ...p, current: e.target.value }))}
                    className="w-full pl-9 pr-9 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                    placeholder="••••••••"
                  />
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">New Password (min 8 characters) *</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={passwords.newPass}
                    onChange={(e) => setPasswords(p => ({ ...p, newPass: e.target.value }))}
                    className="w-full pl-9 pr-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                    placeholder="••••••••"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Confirm New Password *</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={passwords.confirm}
                    onChange={(e) => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                    className="w-full pl-9 pr-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                    placeholder="••••••••"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Update Password</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
