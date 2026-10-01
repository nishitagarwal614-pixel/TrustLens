import React, { useState } from 'react';
import Navbar from './components/Navbar';
import DisclaimerBanner from './components/DisclaimerBanner';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import AnalyzePage from './pages/AnalyzePage';
import HistoryPage from './pages/HistoryPage';
import CreatorProfilesPage from './pages/CreatorProfilesPage';
import SimulatorPage from './pages/SimulatorPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import { DEMO_PRESETS } from './data/demoData';
import { fetchAnalysisDetail } from './services/api';

export default function App() {
  const [activePage, setActivePage] = useState('landing');
  const [analyzePreset, setAnalyzePreset] = useState(null);
  const [autoRunAnalyze, setAutoRunAnalyze] = useState(false);

  // Trigger quick demo from navbar or landing page hero
  const handleTriggerDemo = () => {
    const demoCase = DEMO_PRESETS[0]; // High-Risk Guaranteed 50% Rise
    setAnalyzePreset(demoCase);
    setAutoRunAnalyze(true);
    setActivePage('analyze');
  };

  const handleNavigate = (pageId, params = {}) => {
    if (params.preset) {
      setAnalyzePreset(params.preset);
      setAutoRunAnalyze(false);
    } else {
      setAnalyzePreset(null);
      setAutoRunAnalyze(false);
    }
    setActivePage(pageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectHistoryItem = async (postId) => {
    try {
      const detail = await fetchAnalysisDetail(postId);
      setAnalyzePreset({
        content: detail.content,
        creator: detail.creator_handle,
        sourceUrl: detail.source_url
      });
      setAutoRunAnalyze(true);
      setActivePage('analyze');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      alert('Failed to load analysis record: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Top Disclaimer Banner */}
      <DisclaimerBanner />

      {/* Navigation Header */}
      <Navbar
        activePage={activePage}
        setActivePage={(p) => handleNavigate(p)}
        onTriggerDemo={handleTriggerDemo}
      />

      {/* Main Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {activePage === 'landing' && (
          <LandingPage
            onNavigate={handleNavigate}
            onTriggerDemo={handleTriggerDemo}
          />
        )}


        {activePage === 'analyze' && (
          <AnalyzePage
            initialPreset={analyzePreset}
            autoRun={autoRunAnalyze}
            onNavigate={handleNavigate}
          />
        )}

        {activePage === 'history' && (
          <HistoryPage 
            onSelectAnalysis={handleSelectHistoryItem} 
            onNavigate={handleNavigate}
          />
        )}

        {activePage === 'creators' && (
          <CreatorProfilesPage onNavigate={handleNavigate} />
        )}

        {activePage === 'simulator' && (
          <SimulatorPage />
        )}

        {activePage === 'reports' && (
          <ReportsPage />
        )}

        {activePage === 'settings' && (
          <SettingsPage />
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
