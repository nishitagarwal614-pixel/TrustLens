import React, { useState, useRef, useEffect } from 'react';
import { 
  Shield, 
  Camera, 
  UploadCloud, 
  Scan, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  HelpCircle, 
  X, 
  RefreshCw, 
  Image as ImageIcon,
  Loader2,
  FileText,
  Link2,
  ExternalLink,
  Globe
} from 'lucide-react';
import { analyzeContent } from '../services/api';
import { useLanguage, SUPPORTED_LANGUAGES } from '../context/LanguageContext';
import VoiceInputButton from '../components/VoiceInputButton';
import HomeVoiceAssistant from '../components/HomeVoiceAssistant';
import AnalyzeVoiceExplainer from '../components/AnalyzeVoiceExplainer';

export default function LandingPage({ onNavigate, userSession: propSession }) {
  const { t, language, setLanguage, userSession: contextSession } = useLanguage();
  const userSession = propSession || contextSession;
  // Input mode: 'photo' | 'text' | 'link'
  const [scanMode, setScanMode] = useState('photo');

  // Scanner state
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [documentText, setDocumentText] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [claimNotes, setClaimNotes] = useState('');
  
  // Camera stream state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  
  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisError, setAnalysisError] = useState('');

  // Refs
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Stop camera helper
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Start live camera
  const startCamera = async () => {
    setCameraError('');
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        if (cameraInputRef.current) {
          cameraInputRef.current.click();
        } else {
          setCameraError('Camera access is not supported on this browser.');
        }
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
    } catch (err) {
      console.error('Camera access error:', err);
      if (cameraInputRef.current) {
        cameraInputRef.current.click();
      } else {
        setCameraError('Unable to access camera. Please upload an image instead.');
      }
    }
  };

  // Capture photo from live camera
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });
        setSelectedImage(file);
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        stopCamera();
        if (!documentText) {
          setDocumentText('Photo captured. Please verify or enter the message text below to check.');
        }
      }
    }, 'image/jpeg');
  };

  // Handle file select (upload or native camera)
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setAnalysisResult(null);
      setAnalysisError('');
      
      if (!documentText) {
        setDocumentText(`Scanned image: ${file.name}\nPlease verify or type the words from your photo below.`);
      }
    }
  };

  // Drag and drop handling
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setAnalysisResult(null);
      setAnalysisError('');
      if (!documentText) {
        setDocumentText(`Scanned image: ${file.name}\nPlease verify or type the words from your photo below.`);
      }
    }
  };

  // Sample quick selections
  const handleSelectSample = (sampleType) => {
    setAnalysisResult(null);
    setAnalysisError('');

    if (sampleType === 'guaranteed') {
      setDocumentText("XYZ stock is guaranteed to rise 50% next month. Buy immediately! Once-in-a-lifetime opportunity. Don't miss out on these risk-free returns!");
      setSourceUrl('https://x.com/RocketTrader99/status/1982348');
      if (scanMode === 'photo') {
        setSelectedImage({ name: 'sample_guaranteed_profit_whatsapp.jpg' });
        setPreviewUrl('https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&q=80');
      }
    } else if (sampleType === 'official') {
      setDocumentText("According to XYZ Ltd's quarterly report, revenue increased by 8.4% year-over-year with consolidated revenue of INR 4,820 Crore.");
      setSourceUrl('https://nseindia.com/filings/xyzltd');
      if (scanMode === 'photo') {
        setSelectedImage({ name: 'sample_official_company_disclosure.jpg' });
        setPreviewUrl('https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80');
      }
    } else if (sampleType === 'urgency') {
      setDocumentText("URGENT: Your bank KYC is pending. Click the link to update your details within 2 hours or your account will be permanently blocked.");
      setSourceUrl('https://suspicious-kyc-portal.net/update');
      if (scanMode === 'photo') {
        setSelectedImage({ name: 'sample_urgent_kyc_sms.jpg' });
        setPreviewUrl('https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80');
      }
    }
  };

  // Clear scanner
  const handleClear = () => {
    stopCamera();
    setSelectedImage(null);
    if (previewUrl && !previewUrl.startsWith('http')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setDocumentText('');
    setSourceUrl('');
    setClaimNotes('');
    setAnalysisResult(null);
    setAnalysisError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  // Perform Analysis using EXISTING backend functionality
  const handleScanNow = async () => {
    let textToAnalyze = '';
    let targetUrl = sourceUrl.trim();

    if (scanMode === 'photo') {
      textToAnalyze = documentText.trim();
      if (!textToAnalyze && selectedImage) {
        textToAnalyze = `Scanned financial document: ${selectedImage.name}`;
      }
      if (!targetUrl && selectedImage) {
        targetUrl = `Photo: ${selectedImage.name}`;
      }
    } else if (scanMode === 'text') {
      textToAnalyze = documentText.trim();
    } else if (scanMode === 'link') {
      if (!targetUrl) {
        setAnalysisError('Please enter a website or social link to check.');
        return;
      }
      textToAnalyze = claimNotes.trim()
        ? `${claimNotes.trim()} (Source link: ${targetUrl})`
        : `Verify financial link and domain authenticity: ${targetUrl}`;
    }

    if (!textToAnalyze || textToAnalyze.length < 3) {
      if (scanMode === 'photo') {
        setAnalysisError('Please enter or verify the message text from your photo to check it.');
      } else if (scanMode === 'text') {
        setAnalysisError('Please type or paste at least 3 characters of text to check.');
      } else {
        setAnalysisError('Please enter a link to check.');
      }
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError('');
    setAnalysisResult(null);

    try {
      const data = await analyzeContent(
        textToAnalyze, 
        targetUrl, 
        scanMode === 'link' ? 'Web Link' : (scanMode === 'photo' ? 'Photo Scan' : 'Text Input')
      );
      setAnalysisResult(data);
      
      setTimeout(() => {
        document.getElementById('analysis-result-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } catch (err) {
      console.error('Scan analysis error:', err);
      setAnalysisError(err.message || 'Verification could not be completed. Please check your connection and retry.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Helper to map result status to non-absolute terminology (Requirement 8)
  const getStatusPresentation = (result) => {
    const risk = result.risk_level?.toLowerCase() || '';
    const status = result.overall_status || '';

    if (risk === 'high' || status === 'Contradicted') {
      return {
        label: 'Potential Fraud',
        color: 'text-[#ED1C24] bg-[#FFF9F9] border-[#F3B6BA]',
        badge: 'bg-[#ED1C24] text-white',
        icon: AlertOctagon,
        subtext: 'This content contains high-risk elements or conflicts with official government / exchange records.'
      };
    }

    if (risk === 'safe' || status === 'Verified') {
      return {
        label: 'Likely Genuine',
        color: 'text-[#138808] bg-[#EAF6EA] border-[#B8DDB8]',
        badge: 'bg-[#138808] text-white',
        icon: CheckCircle2,
        subtext: 'This information matches official corporate or regulatory announcements and shows no obvious fraud triggers.'
      };
    }

    return {
      label: 'Needs Verification',
      color: 'text-[#8C4A00] bg-[#FFF7D6] border-[#F6D8A8]',
      badge: 'bg-[#E09F00] text-white',
      icon: HelpCircle,
      subtext: 'This statement could not be fully confirmed against official records. Always verify before trusting.'
    };
  };

  const statusInfo = analysisResult ? getStatusPresentation(analysisResult) : null;
  const StatusIcon = statusInfo?.icon;

  // Determine if scan button is disabled
  const isButtonDisabled = isAnalyzing || (
    scanMode === 'photo' 
      ? (!selectedImage && !documentText.trim()) 
      : scanMode === 'text' 
        ? !documentText.trim() 
        : !sourceUrl.trim()
  );

  return (
    <div className="w-full bg-[#F5F6F8] text-[#172033]">

      {/* Main Content Flow */}
      <div className="max-w-5xl mx-auto px-4 py-4 sm:py-6 space-y-10">
        
        {/* User Session & Direct 1-Click Language Switcher Bar on Home Page */}
        <div className="bg-white border border-[#D8DEE8] rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5 transition-all">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-[#138808] ring-4 ring-[#EAF6EA] flex-shrink-0" />
              <span className="font-bold text-[#0B2E73] text-sm sm:text-base">
                {t?.landing?.greeting || 'Welcome'}, {userSession?.name || (userSession?.mode === 'profile' ? 'Investor' : (t?.nav?.guest || 'Guest'))}!
              </span>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <span className="text-slate-600 text-xs sm:text-sm">
                {t?.landing?.langLabel || 'Current Language'}: <strong className="text-[#123A8C] font-bold">{SUPPORTED_LANGUAGES.find(l => l.id === language)?.native || 'English'}</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('welcome')}
              className="text-xs font-semibold text-[#4635B1] hover:text-[#352580] hover:bg-[#F1EEFA] px-3.5 py-1.5 rounded-xl border border-[#C8C1E8] transition-colors cursor-pointer flex items-center gap-1.5"
              title="Change Profile or full onboarding flow"
            >
              <span>👤</span>
              <span>{t?.landing?.changeBtn || 'Change Profile →'}</span>
            </button>
          </div>

          {/* Direct 1-Click Language Switcher Row */}
          <div className="pt-2.5 border-t border-[#D8DEE8]/70 flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="text-xs font-bold text-[#0B2E73] flex items-center gap-1.5 mr-1 select-none">
              <Globe className="w-3.5 h-3.5 text-[#123A8C]" />
              <span>
                {language === 'hi' ? 'अपनी भाषा चुनें:' : 
                 language === 'mr' ? 'तुमची भाषा निवडा:' : 
                 language === 'ta' ? 'மொழியை மாற்றவும்:' : 
                 language === 'te' ? 'మీ భాషను ఎంచుకోండి:' : 
                 language === 'kn' ? 'ನಿಮ್ಮ ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ:' : 
                 'Choose Language:'}
              </span>
            </span>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {SUPPORTED_LANGUAGES.map((lang) => {
                const isSelected = language === lang.id;
                return (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => setLanguage(lang.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#0B2E73] text-white shadow-md shadow-[#0B2E73]/25 ring-2 ring-[#B8CBE8] scale-102'
                        : 'bg-slate-100 hover:bg-[#EAF2FC] text-slate-700 hover:text-[#123A8C] border border-[#D8DEE8] hover:border-[#B8CBE8]'
                    }`}
                    title={`Switch to ${lang.name} (${lang.native})`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.native}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* --------------------------------------------------
            2. MAIN HERO SECTION + TOP-RIGHT PRECAUTION STATEMENT
            - "Check Before You Trust" (translated)
            -------------------------------------------------- */}
        <section className="relative">
          <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-6">
            
            {/* Left: Heading & Subheading */}
            <div className="flex-1 text-center lg:text-left space-y-3">
              <h1 className="text-3xl sm:text-5xl font-black text-[#0B2E73] tracking-tight">
                {t?.landing?.heroTitle || 'Check Before You Trust'}
              </h1>
              <div className="w-24 h-1.5 bg-[#ED1C24] rounded-full mx-auto lg:mx-0 my-2" />
              <p className="text-base sm:text-xl text-slate-600 max-w-xl font-medium leading-relaxed">
                {t?.landing?.heroSub || 'Scan a message, notice, offer, or financial document to check whether it may be genuine or a possible fraud.'}
              </p>
            </div>

            {/* Top-Right: Precaution Statement Box (matches user uploaded screenshot) */}
            <div className="w-full lg:w-96 flex-shrink-0">
              <div className="p-4 rounded-2xl bg-[#FFF9F9] border border-[#F3B6BA] text-xs sm:text-[13px] leading-relaxed shadow-sm">
                <p className="font-extrabold text-[#ED1C24] mb-1 flex items-center gap-1.5 text-xs sm:text-sm">
                  <AlertTriangle className="w-4 h-4 text-[#ED1C24] flex-shrink-0" />
                  <span>{t?.landing?.importantTitle || 'Important:'}</span>
                </p>
                <p className="text-slate-700 text-xs leading-relaxed">
                  {t?.landing?.importantText || 'Results are based on the current knowledge available from official government statements and information about financial fraud. Always verify important financial information with the official source before taking action.'}
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* --------------------------------------------------
            3. LARGE SCANNER IN THE CENTER
            -------------------------------------------------- */}
        <section className="bg-white rounded-3xl border-2 border-[#D8DEE8] shadow-xl p-6 sm:p-10 space-y-6 transition-all hover:border-[#123A8C]/40">
          
          {/* Top Scan Title & Large Icon */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl bg-[#F1EEFA] text-[#4635B1] flex items-center justify-center border border-[#C8C1E8] shadow-sm">
              {scanMode === 'photo' && <Scan className="w-8 h-8 sm:w-10 sm:h-10 text-[#4635B1]" />}
              {scanMode === 'text' && <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-[#4635B1]" />}
              {scanMode === 'link' && <Link2 className="w-8 h-8 sm:w-10 sm:h-10 text-[#4635B1]" />}
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B2E73]">
              {scanMode === 'photo' && (t?.landing?.scanPhotoTitle || 'Scan Photo')}
              {scanMode === 'text' && (t?.landing?.scanTextTitle || 'Check Text')}
              {scanMode === 'link' && (t?.landing?.scanLinkTitle || 'Check Link')}
            </h2>
            
            <p className="text-sm sm:text-base text-slate-500 font-medium">
              {scanMode === 'photo' && (t?.landing?.uploadPrompt || 'Take a photo or upload an image')}
              {scanMode === 'text' && (t?.landing?.textPlaceholder || 'Type or paste any message, post, SMS, or notice to check')}
              {scanMode === 'link' && (t?.landing?.linkPlaceholder || 'Enter any website, article, or social media link to check')}
            </p>
          </div>

          {/* Option Selector: Photo | Text | Link */}
          <div className="flex items-center justify-center p-1.5 bg-slate-100 rounded-2xl gap-1 max-w-md mx-auto border border-[#D8DEE8]/60">
            <button
              type="button"
              onClick={() => { setScanMode('photo'); setAnalysisError(''); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                scanMode === 'photo'
                  ? 'bg-[#4635B1] text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#0B2E73] hover:bg-slate-200/60'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>{t?.landing?.tabPhoto || 'Scan Photo'}</span>
            </button>

            <button
              type="button"
              onClick={() => { setScanMode('text'); setAnalysisError(''); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                scanMode === 'text'
                  ? 'bg-[#4635B1] text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#0B2E73] hover:bg-slate-200/60'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>{t?.landing?.tabText || 'Check Text'}</span>
            </button>

            <button
              type="button"
              onClick={() => { setScanMode('link'); setAnalysisError(''); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                scanMode === 'link'
                  ? 'bg-[#4635B1] text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#0B2E73] hover:bg-slate-200/60'
              }`}
            >
              <Link2 className="w-4 h-4" />
              <span>{t?.landing?.tabLink || 'Check Link'}</span>
            </button>
          </div>

          {/* Hidden inputs for camera & file upload */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />
          <input 
            type="file" 
            ref={cameraInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            capture="environment" 
            className="hidden" 
          />

          {/* --------------------
              MODE 1: PHOTO / CAMERA
              -------------------- */}
          {scanMode === 'photo' && (
            <>
              {!previewUrl && !isCameraActive ? (
                <div 
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-[#B8CBE8] rounded-2xl p-6 sm:p-8 bg-[#F8FAFC] text-center space-y-5 hover:bg-[#EAF2FC]/40 hover:border-[#123A8C]/50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
                    {/* Button: Take Photo */}
                    <button
                      type="button"
                      onClick={startCamera}
                      className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#123A8C] hover:bg-[#0B2E73] text-white font-bold text-sm sm:text-base shadow-md transition-all active:scale-95 cursor-pointer"
                    >
                      <Camera className="w-5 h-5" />
                      <span>{t?.landing?.takePhoto || 'Take a Photo'}</span>
                    </button>

                    {/* Button: Upload Image */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-[#123A8C] border-2 border-[#123A8C] font-bold text-sm sm:text-base transition-all active:scale-95 cursor-pointer"
                    >
                      <UploadCloud className="w-5 h-5 text-[#123A8C]" />
                      <span>{t?.landing?.uploadPhoto || 'Upload Image'}</span>
                    </button>
                  </div>

                  {cameraError && (
                    <div className="p-3 bg-[#FFF7D6] border border-[#F6D8A8] rounded-lg text-[#8C4A00] text-xs sm:text-sm">
                      {cameraError}
                    </div>
                  )}

                  <p className="text-xs text-slate-400">
                    Supports JPG, PNG, Screenshots, and Camera photos • Drag and drop here
                  </p>

                  {/* Sample Document Quick-Select */}
                  <div className="pt-3 border-t border-[#D8DEE8]">
                    <p className="text-xs font-semibold text-slate-500 mb-2">Or test with a sample document:</p>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSelectSample('guaranteed')}
                        className="px-3 py-1.5 rounded-lg bg-[#FDEBEC] hover:bg-[#FCD8DA] text-[#ED1C24] border border-[#F3B6BA] text-xs font-medium transition-colors cursor-pointer"
                      >
                        Guaranteed Profit Offer
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectSample('official')}
                        className="px-3 py-1.5 rounded-lg bg-[#EAF6EA] hover:bg-[#D5EED5] text-[#138808] border border-[#B8DDB8] text-xs font-medium transition-colors cursor-pointer"
                      >
                        Official Company Filing
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectSample('urgency')}
                        className="px-3 py-1.5 rounded-lg bg-[#FFF7D6] hover:bg-[#FEEDAA] text-[#8C4A00] border border-[#F6D8A8] text-xs font-medium transition-colors cursor-pointer"
                      >
                        Urgent KYC Message
                      </button>
                    </div>
                  </div>
                </div>
              ) : isCameraActive ? (
                /* Live Camera Viewfinder */
                <div className="border-2 border-[#123A8C] rounded-2xl p-4 bg-[#0B2E73] text-center space-y-4 shadow-inner">
                  <div className="relative mx-auto max-w-md rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center">
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-white/60 m-4 rounded-lg flex items-center justify-center">
                      <span className="text-xs text-white/80 bg-black/50 px-2 py-1 rounded">Align document or text here</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#123A8C] hover:bg-[#0B2E73] text-white font-bold text-sm shadow-lg active:scale-95 cursor-pointer"
                    >
                      <Camera className="w-5 h-5" />
                      <span>Capture Photo</span>
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* Image Preview & Document Text Review */
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#D8DEE8] flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-200 flex-shrink-0 border border-slate-300 relative group">
                      {previewUrl ? (
                        <img 
                          src={previewUrl} 
                          alt="Scanned Document" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <ImageIcon className="w-8 h-8" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 text-center sm:text-left space-y-1">
                      <p className="text-xs font-bold uppercase tracking-wider text-[#123A8C]">
                        Ready to Scan
                      </p>
                      <p className="text-sm font-semibold text-slate-800 truncate max-w-xs sm:max-w-md">
                        {selectedImage?.name || 'Selected Document Photo'}
                      </p>
                      <p className="text-xs text-slate-500">
                        Review or adjust the message text below to ensure maximum accuracy.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleClear}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-[#D8DEE8] hover:bg-slate-100 text-slate-700 text-xs font-semibold shadow-sm transition-all cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Change Photo</span>
                    </button>
                  </div>

                  {/* Editable Text Field */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      {t?.landing?.photoTextLabel || 'Message or Document Text:'}
                    </label>
                    <textarea
                      rows={3}
                      value={documentText}
                      onChange={(e) => setDocumentText(e.target.value)}
                      placeholder={t?.landing?.photoTextPlaceholder || 'Type or paste the words from your photo here...'}
                      className="w-full p-3.5 rounded-xl border border-[#D8DEE8] text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#123A8C] focus:border-[#123A8C] font-sans leading-relaxed"
                    />
                    <p className="text-[11px] text-slate-500">
                      You can edit the text to match what is written in your photo.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* --------------------
              MODE 2: TEXT MESSAGE INPUT
              -------------------- */}
          {scanMode === 'text' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="block text-xs font-bold text-slate-700">
                    {t?.landing?.scanTextTitle || 'Message or Financial Text to Check:'}
                  </label>
                  <VoiceInputButton
                    buttonText="Speak Message"
                    lang={language}
                    onTranscript={(spoken) => {
                      setDocumentText((prev) => prev && prev.trim() ? `${prev.trim()} ${spoken}` : spoken);
                    }}
                  />
                </div>
                <textarea
                  rows={5}
                  value={documentText}
                  onChange={(e) => setDocumentText(e.target.value)}
                  placeholder={t?.landing?.textPlaceholder || 'Paste any financial message, WhatsApp forward, SMS, advertisement, investment claim, or stock recommendation here...'}
                  className="w-full p-4 rounded-xl border border-[#D8DEE8] text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#123A8C] focus:border-[#123A8C] font-sans leading-relaxed"
                />
              </div>

              {/* Optional source link in text mode */}
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-500">
                  Website or source link (optional):
                </label>
                <input
                  type="url"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://x.com/... or https://t.me/..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8DEE8] text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#123A8C]"
                />
              </div>

              {/* Sample text quick buttons */}
              <div className="pt-2 border-t border-[#D8DEE8]">
                <p className="text-xs font-semibold text-slate-500 mb-2">Or load a sample message:</p>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectSample('guaranteed')}
                    className="px-3 py-1.5 rounded-lg bg-[#FDEBEC] hover:bg-[#FCD8DA] text-[#ED1C24] border border-[#F3B6BA] text-xs font-medium transition-colors cursor-pointer"
                  >
                    Guaranteed 50% Profit Message
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectSample('official')}
                    className="px-3 py-1.5 rounded-lg bg-[#EAF6EA] hover:bg-[#D5EED5] text-[#138808] border border-[#B8DDB8] text-xs font-medium transition-colors cursor-pointer"
                  >
                    Audited Company Results
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectSample('urgency')}
                    className="px-3 py-1.5 rounded-lg bg-[#FFF7D6] hover:bg-[#FEEDAA] text-[#8C4A00] border border-[#F6D8A8] text-xs font-medium transition-colors cursor-pointer"
                  >
                    Urgent KYC Deadline SMS
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* --------------------
              MODE 3: LINK / URL INPUT
              -------------------- */}
          {scanMode === 'link' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  {t?.landing?.scanLinkTitle || 'Link or Website to Check:'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Link2 className="w-4 h-4" />
                  </div>
                  <input
                    type="url"
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    placeholder={t?.landing?.linkPlaceholder || 'https://t.me/channel or https://example.com/offer'}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#D8DEE8] text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#123A8C] focus:border-[#123A8C] font-sans"
                  />
                </div>
              </div>

              {/* Optional claim notes */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-600">
                  {t?.landing?.linkNotesLabel || 'What does this link claim or offer? (optional):'}
                </label>
                <textarea
                  rows={3}
                  value={claimNotes}
                  onChange={(e) => setClaimNotes(e.target.value)}
                  placeholder={t?.landing?.linkNotesPlaceholder || 'e.g. Promises 30% monthly returns, asks for advance registration fee, or offers guaranteed stock tips...'}
                  className="w-full p-3.5 rounded-xl border border-[#D8DEE8] text-xs sm:text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#123A8C] font-sans"
                />
              </div>

              {/* Sample link buttons */}
              <div className="pt-2 border-t border-[#D8DEE8]">
                <p className="text-xs font-semibold text-slate-500 mb-2">Or test with a sample link:</p>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSourceUrl('https://x.com/RocketTrader99/status/1982348');
                      setClaimNotes('XYZ stock is guaranteed to rise 50% next month. Buy immediately!');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#FDEBEC] hover:bg-[#FCD8DA] text-[#ED1C24] border border-[#F3B6BA] text-xs font-medium transition-colors cursor-pointer"
                  >
                    Guaranteed Return Post Link
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSourceUrl('https://nseindia.com/filings/xyzltd');
                      setClaimNotes('According to XYZ Ltd quarterly report, revenue increased by 8.4% year-over-year.');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#EAF6EA] hover:bg-[#D5EED5] text-[#138808] border border-[#B8DDB8] text-xs font-medium transition-colors cursor-pointer"
                  >
                    Official Regulatory Link
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSourceUrl('https://suspicious-kyc-portal.net/update');
                      setClaimNotes('URGENT: Your bank KYC is pending. Account permanently blocked.');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#FFF7D6] hover:bg-[#FEEDAA] text-[#8C4A00] border border-[#F6D8A8] text-xs font-medium transition-colors cursor-pointer"
                  >
                    Suspicious KYC Link
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {analysisError && (
            <div className="p-4 bg-[#FFF9F9] border border-[#F3B6BA] rounded-xl text-[#ED1C24] text-xs sm:text-sm flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-[#ED1C24] flex-shrink-0 mt-0.5" />
              <span>{analysisError}</span>
            </div>
          )}

          {/* Prominent Button: "Scan Now" */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleScanNow}
              disabled={isButtonDisabled}
              className="w-full py-4 px-8 rounded-2xl bg-[#123A8C] hover:bg-[#0B2E73] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-extrabold text-lg sm:text-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 active:scale-98 cursor-pointer"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin text-white" />
                  <span>{t?.landing?.scanning || 'Checking against official records...'}</span>
                </>
              ) : (
                <>
                  <Scan className="w-6 h-6" />
                  <span>{t?.landing?.scanNowBtn || 'Scan Now & Verify'}</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* --------------------------------------------------
            8. RESULTS DISPLAY (Shown after scanning)
            - Respects non-absolute wording:
              - "Likely Genuine"
              - "Potential Fraud"
              - "Needs Verification"
            -------------------------------------------------- */}
        {analysisResult && (
          <section id="analysis-result-section" className="space-y-4 scroll-mt-20">
            <div className={`p-6 sm:p-8 rounded-3xl border-2 ${statusInfo.color} shadow-lg space-y-4`}>
              
              {/* Header Status Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/80">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl ${statusInfo.badge} shadow-md`}>
                    <StatusIcon className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Verification Assessment
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
                      {statusInfo.label}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/80 border border-slate-200 text-slate-700">
                    Risk Level: {analysisResult.risk_level || 'Moderate'}
                  </span>
                </div>
              </div>

              {/* Voice Explainer & Audio Verification */}
              <AnalyzeVoiceExplainer result={analysisResult} content={documentText || claimNotes || sourceUrl} />

              {/* Status Explanation */}
              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-800">
                  {statusInfo.subtext}
                </p>
                <div className="bg-white/90 p-4 rounded-2xl border border-slate-200/80 text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {analysisResult.explanation}
                </div>
              </div>

              {/* Red Flags summary if any */}
              {analysisResult.red_flags?.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#ED1C24] flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#ED1C24]" />
                    <span>Warning Signs Detected ({analysisResult.red_flags.length}):</span>
                  </span>
                  <div className="space-y-1.5">
                    {analysisResult.red_flags.map((flag, idx) => (
                      <div key={idx} className="bg-white/90 border border-[#F3B6BA] p-3 rounded-xl text-xs text-[#ED1C24] flex items-start gap-2">
                        <span className="font-bold">• {flag.type}:</span>
                        <span className="text-slate-700">{flag.explanation}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="pt-3 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={handleClear}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-[#D8DEE8] text-slate-700 text-xs font-bold shadow-sm transition-all cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Check Another Item</span>
                </button>

                <button
                  onClick={() => onNavigate('analyze', { preset: { content: documentText || claimNotes || sourceUrl, label: 'Checked Submission' } })}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0B2E73] hover:bg-[#123A8C] text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                >
                  <span>View Detailed Report</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Non-guarantee note */}
              <p className="text-[11px] text-slate-500 italic text-center pt-2">
                Automated verification based on available official records. This is not an absolute guarantee. Always verify with official authorities.
              </p>
            </div>
          </section>
        )}

        {/* --------------------------------------------------
            4. ANALYSE DATA (Secondary option)
            - "Analyse Data →"
            - Connects to EXISTING Analyse Data functionality
            - Scanner remains visually more prominent
            -------------------------------------------------- */}
        <section className="text-center pt-2">
          <button
            onClick={() => onNavigate('analyze')}
            className="inline-flex items-center gap-2 text-[#123A8C] hover:text-[#0B2E73] font-bold text-base sm:text-lg py-2 px-6 rounded-xl hover:bg-blue-50/50 transition-all group cursor-pointer"
          >
            <span>{t?.nav?.analyze || 'Analyse Data'}</span>
            <ArrowRight className="w-5 h-5 text-[#123A8C] transition-transform group-hover:translate-x-1" />
          </button>
        </section>

        {/* --------------------------------------------------
            6. SIMPLE EXPLANATION
            - "You can scan screenshots, messages, advertisements,
              notices, payment-related information, or other financial information."
            -------------------------------------------------- */}
        <section className="max-w-2xl mx-auto text-center px-4">
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            You can scan screenshots, messages, advertisements, notices, payment-related information, or other financial information.
          </p>
        </section>

      </div>

      {/* Floating Conversational Voice Assistant for Home Page */}
      <HomeVoiceAssistant 
        onNavigate={onNavigate} 
        activeResult={analysisResult}
        onFillScanner={(text) => { 
          setScanMode('text'); 
          setDocumentText(text); 
          document.querySelector('textarea')?.focus();
        }} 
      />
    </div>
  );
}
