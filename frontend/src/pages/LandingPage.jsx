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
  ExternalLink
} from 'lucide-react';
import { analyzeContent } from '../services/api';

export default function LandingPage({ onNavigate }) {
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
        color: 'text-rose-700 bg-rose-50 border-rose-200',
        badge: 'bg-rose-600 text-white',
        icon: AlertOctagon,
        subtext: 'This content contains high-risk elements or conflicts with official government / exchange records.'
      };
    }

    if (risk === 'safe' || status === 'Verified') {
      return {
        label: 'Likely Genuine',
        color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        badge: 'bg-emerald-600 text-white',
        icon: CheckCircle2,
        subtext: 'This information matches official corporate or regulatory announcements and shows no obvious fraud triggers.'
      };
    }

    return {
      label: 'Needs Verification',
      color: 'text-amber-800 bg-amber-50 border-amber-200',
      badge: 'bg-amber-600 text-white',
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
    <div className="w-full bg-slate-50 text-slate-800">

      {/* Main Content Flow */}
      <div className="max-w-5xl mx-auto px-4 py-4 sm:py-6 space-y-10">
        
        {/* --------------------------------------------------
            2. MAIN HERO SECTION + TOP-RIGHT PRECAUTION STATEMENT
            - "Check Before You Trust"
            - Subheading for low digital literacy
            - Precaution statement placed in top right of "Check Before You Trust"
            -------------------------------------------------- */}
        <section className="relative">
          <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-6">
            
            {/* Left: Heading & Subheading */}
            <div className="flex-1 text-center lg:text-left space-y-3">
              <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
                Check Before You Trust
              </h1>
              <p className="text-base sm:text-xl text-slate-600 max-w-xl font-medium leading-relaxed">
                Scan a message, notice, offer, or financial document to check whether it may be genuine or a possible fraud.
              </p>
            </div>

            {/* Top-Right: Precaution Statement Box (matches user uploaded screenshot) */}
            <div className="w-full lg:w-96 flex-shrink-0">
              <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-300 text-amber-950 text-xs sm:text-[13px] leading-relaxed shadow-sm">
                <p className="font-extrabold text-amber-900 mb-1 flex items-center gap-1.5 text-xs sm:text-sm">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>Important:</span>
                </p>
                <p className="text-slate-700 text-xs leading-relaxed">
                  Results are based on the current knowledge available from official government statements and information about financial fraud. Always verify important financial information with the official source before taking action.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* --------------------------------------------------
            3. LARGE SCANNER IN THE CENTER
            - Main focus of the homepage
            - Includes options for:
              1. Scan Photo / Image
              2. Text message input
              3. Link / URL check
            - Prominent button: "Scan Now"
            -------------------------------------------------- */}
        <section className="bg-white rounded-3xl border-2 border-slate-200 shadow-xl p-6 sm:p-10 space-y-6 transition-all hover:border-blue-400">
          
          {/* Top Scan Title & Large Icon */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-sm">
              {scanMode === 'photo' && <Scan className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />}
              {scanMode === 'text' && <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />}
              {scanMode === 'link' && <Link2 className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />}
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {scanMode === 'photo' && 'Scan Photo'}
              {scanMode === 'text' && 'Check Text'}
              {scanMode === 'link' && 'Check Link'}
            </h2>
            
            <p className="text-sm sm:text-base text-slate-500 font-medium">
              {scanMode === 'photo' && 'Take a photo or upload an image'}
              {scanMode === 'text' && 'Type or paste any message, post, SMS, or notice to check'}
              {scanMode === 'link' && 'Enter any website, article, or social media link to check'}
            </p>
          </div>

          {/* Option Selector: Photo | Text | Link */}
          <div className="flex items-center justify-center p-1.5 bg-slate-100 rounded-2xl gap-1 max-w-md mx-auto">
            <button
              type="button"
              onClick={() => { setScanMode('photo'); setAnalysisError(''); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                scanMode === 'photo'
                  ? 'bg-white text-blue-600 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Scan Photo</span>
            </button>

            <button
              type="button"
              onClick={() => { setScanMode('text'); setAnalysisError(''); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                scanMode === 'text'
                  ? 'bg-white text-blue-600 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Check Text</span>
            </button>

            <button
              type="button"
              onClick={() => { setScanMode('link'); setAnalysisError(''); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                scanMode === 'link'
                  ? 'bg-white text-blue-600 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Link2 className="w-4 h-4" />
              <span>Check Link</span>
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
                  className="border-2 border-dashed border-slate-300 rounded-2xl p-6 sm:p-8 bg-slate-50/70 text-center space-y-5 hover:bg-blue-50/40 hover:border-blue-300 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
                    {/* Button: Take Photo */}
                    <button
                      type="button"
                      onClick={startCamera}
                      className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm sm:text-base shadow-md transition-all active:scale-95"
                    >
                      <Camera className="w-5 h-5" />
                      <span>Take a Photo</span>
                    </button>

                    {/* Button: Upload Image */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border-2 border-slate-300 font-bold text-sm sm:text-base transition-all active:scale-95"
                    >
                      <UploadCloud className="w-5 h-5 text-blue-600" />
                      <span>Upload Image</span>
                    </button>
                  </div>

                  {cameraError && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs sm:text-sm">
                      {cameraError}
                    </div>
                  )}

                  <p className="text-xs text-slate-400">
                    Supports JPG, PNG, Screenshots, and Camera photos • Drag and drop here
                  </p>

                  {/* Sample Document Quick-Select */}
                  <div className="pt-3 border-t border-slate-200">
                    <p className="text-xs font-semibold text-slate-500 mb-2">Or test with a sample document:</p>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSelectSample('guaranteed')}
                        className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-medium transition-colors"
                      >
                        Guaranteed Profit Offer
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectSample('official')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-medium transition-colors"
                      >
                        Official Company Filing
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectSample('urgency')}
                        className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-medium transition-colors"
                      >
                        Urgent KYC Message
                      </button>
                    </div>
                  </div>
                </div>
              ) : isCameraActive ? (
                /* Live Camera Viewfinder */
                <div className="border-2 border-blue-500 rounded-2xl p-4 bg-slate-900 text-center space-y-4 shadow-inner">
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
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg active:scale-95"
                    >
                      <Camera className="w-5 h-5" />
                      <span>Capture Photo</span>
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* Image Preview & Document Text Review */
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
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
                      <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
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
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold shadow-sm transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Change Photo</span>
                    </button>
                  </div>

                  {/* Editable Text Field */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Message or Document Text:
                    </label>
                    <textarea
                      rows={3}
                      value={documentText}
                      onChange={(e) => setDocumentText(e.target.value)}
                      placeholder="Type or paste the words from your photo here..."
                      className="w-full p-3.5 rounded-xl border border-slate-300 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-sans leading-relaxed"
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
                <label className="block text-xs font-bold text-slate-700">
                  Message or Financial Text to Check:
                </label>
                <textarea
                  rows={5}
                  value={documentText}
                  onChange={(e) => setDocumentText(e.target.value)}
                  placeholder="Paste any financial message, WhatsApp forward, SMS, advertisement, investment claim, or stock recommendation here..."
                  className="w-full p-4 rounded-xl border border-slate-300 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-sans leading-relaxed"
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Sample text quick buttons */}
              <div className="pt-2 border-t border-slate-200">
                <p className="text-xs font-semibold text-slate-500 mb-2">Or load a sample message:</p>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectSample('guaranteed')}
                    className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-medium transition-colors"
                  >
                    Guaranteed 50% Profit Message
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectSample('official')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-medium transition-colors"
                  >
                    Audited Company Results
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectSample('urgency')}
                    className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-medium transition-colors"
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
                  Link or Website to Check:
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Link2 className="w-4 h-4" />
                  </div>
                  <input
                    type="url"
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    placeholder="https://t.me/channel or https://example.com/offer"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-sans"
                  />
                </div>
              </div>

              {/* Optional claim notes */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-600">
                  What does this link claim or offer? (optional):
                </label>
                <textarea
                  rows={3}
                  value={claimNotes}
                  onChange={(e) => setClaimNotes(e.target.value)}
                  placeholder="e.g. Promises 30% monthly returns, asks for advance registration fee, or offers guaranteed stock tips..."
                  className="w-full p-3.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
                />
              </div>

              {/* Sample link buttons */}
              <div className="pt-2 border-t border-slate-200">
                <p className="text-xs font-semibold text-slate-500 mb-2">Or test with a sample link:</p>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSourceUrl('https://x.com/RocketTrader99/status/1982348');
                      setClaimNotes('XYZ stock is guaranteed to rise 50% next month. Buy immediately!');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-medium transition-colors"
                  >
                    Guaranteed Return Post Link
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSourceUrl('https://nseindia.com/filings/xyzltd');
                      setClaimNotes('According to XYZ Ltd quarterly report, revenue increased by 8.4% year-over-year.');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-medium transition-colors"
                  >
                    Official Regulatory Link
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSourceUrl('https://suspicious-kyc-portal.net/update');
                      setClaimNotes('URGENT: Your bank KYC is pending. Account permanently blocked.');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-medium transition-colors"
                  >
                    Suspicious KYC Link
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {analysisError && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs sm:text-sm flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{analysisError}</span>
            </div>
          )}

          {/* Prominent Button: "Scan Now" */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleScanNow}
              disabled={isButtonDisabled}
              className="w-full py-4 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-extrabold text-lg sm:text-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 active:scale-98"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin text-white" />
                  <span>Checking against official records...</span>
                </>
              ) : (
                <>
                  <Scan className="w-6 h-6" />
                  <span>
                    {scanMode === 'photo' && 'Scan Photo Now'}
                    {scanMode === 'text' && 'Check Text Now'}
                    {scanMode === 'link' && 'Check Link Now'}
                  </span>
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
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Warning Signs Detected ({analysisResult.red_flags.length}):</span>
                  </span>
                  <div className="space-y-1.5">
                    {analysisResult.red_flags.map((flag, idx) => (
                      <div key={idx} className="bg-white/90 border border-rose-200 p-3 rounded-xl text-xs text-rose-900 flex items-start gap-2">
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
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold shadow-sm transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Check Another Item</span>
                </button>

                <button
                  onClick={() => onNavigate('analyze', { preset: { content: documentText || claimNotes || sourceUrl, label: 'Checked Submission' } })}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-all"
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
            className="inline-flex items-center gap-2 text-slate-700 hover:text-blue-600 font-bold text-base sm:text-lg py-2 px-6 rounded-xl hover:bg-slate-100 transition-all group"
          >
            <span>Analyse Data</span>
            <ArrowRight className="w-5 h-5 text-blue-600 transition-transform group-hover:translate-x-1" />
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
    </div>
  );
}
