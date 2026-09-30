import React, { useState, useEffect, useMemo } from 'react';
import QRCode from 'qrcode';
import { 
  QrCode, 
  Smartphone, 
  Copy, 
  Check, 
  ShieldCheck, 
  AlertCircle, 
  Lock, 
  CheckCircle2, 
  RefreshCw,
  ExternalLink,
  MessageCircle,
  HelpCircle,
  Download
} from 'lucide-react';

// Verified Primary PhonePe UPI ID (from official PhonePe QR standee in repository)
export const MERCHANT_UPI_ID = '8019212948@axl';
export const MERCHANT_NAME = 'SINGIREDDY JASHWANTH';
export const ALT_MERCHANT_UPI_ID = '8985993948@ybl';
export const MERCHANT_PHONE = '8985993948';

/**
 * Builds compliant UPI payment URI with verified PhonePe merchant parameters
 */
export const buildUpiUri = ({ amount, orderId, app = 'generic' }) => {
  const numAmount = Number(amount);
  const formattedAmount = Number.isFinite(numAmount) ? numAmount.toFixed(2) : String(amount);
  const cleanUpiId = MERCHANT_UPI_ID.trim();
  const cleanOrderId = String(orderId || '').replace(/[^a-zA-Z0-9]/g, '');
  const encodedName = encodeURIComponent(MERCHANT_NAME.trim());

  // Standard NPCI URI with verified PhonePe QR parameters (mode=02, mc=0000, purpose=00)
  let baseParams = `pa=${cleanUpiId}&pn=${encodedName}&mc=0000&mode=02&purpose=00&am=${formattedAmount}&cu=INR`;
  if (cleanOrderId) {
    baseParams += `&tn=${cleanOrderId}`;
  }

  switch (app) {
    case 'phonepe':
      return `phonepe://pay?${baseParams}`;
    case 'gpay':
      return `tez://upi/pay?${baseParams}`;
    case 'paytm':
      return `paytmmp://pay?${baseParams}`;
    default:
      return `upi://pay?${baseParams}`;
  }
};

const UpiPaymentView = ({ 
  orderId, 
  amount, 
  serverUpiLink, 
  onConfirmPayment,
  onChangePaymentMethod
}) => {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [qrLoading, setQrLoading] = useState(true);
  const [copiedId, setCopiedId] = useState('');
  const [appOpenError, setAppOpenError] = useState(false);
  const [hasAttemptedAppPay, setHasAttemptedAppPay] = useState(false);
  const [lastLaunchedApp, setLastLaunchedApp] = useState('');
  const [utrNumber, setUtrNumber] = useState('');

  const [isMobileDevice] = useState(() => {
    if (typeof window === 'undefined') return false;
    const isMobileScreen = window.innerWidth <= 768;
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isMobileUA = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
    return isMobileScreen || (hasTouch && isMobileUA);
  });

  const [activeTab, setActiveTab] = useState(() => (isMobileDevice ? 'apps' : 'dynamic_qr'));

  const finalAmount = Number(amount) || 0;
  const formattedDisplayAmount = finalAmount.toLocaleString('en-IN');

  // Always use client-built verified UPI URI with correct PhonePe parameters (no forbidden tr=)
  const upiUri = useMemo(() => {
    return buildUpiUri({ amount: finalAmount, orderId });
  }, [finalAmount, orderId]);

  // Generate dynamic QR code matching the exact amount & verified merchant VPA
  useEffect(() => {
    let cancelled = false;

    QRCode.toDataURL(upiUri, {
      width: 320,
      margin: 2,
      color: {
        dark: '#071A2F',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    })
      .then((url) => {
        if (!cancelled) {
          setQrDataUrl(url);
          setQrLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to generate dynamic UPI QR code:', err);
        if (!cancelled) {
          setQrLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [upiUri]);

  // Copy helper
  const handleCopyText = async (text, id) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopiedId(id);
      setTimeout(() => setCopiedId(''), 2500);
    } catch (err) {
      console.warn('Clipboard copy error:', err);
    }
  };

  // Launch specific or generic UPI App with fallback
  const handleLaunchApp = (appType = 'generic') => {
    setAppOpenError(false);
    setHasAttemptedAppPay(true);
    setLastLaunchedApp(appType);

    const targetUri = buildUpiUri({ amount: finalAmount, orderId, app: appType });
    const genericUri = buildUpiUri({ amount: finalAmount, orderId, app: 'generic' });

    let appLaunched = false;
    const handleVisibility = () => {
      if (document.hidden) {
        appLaunched = true;
      }
    };

    document.addEventListener('visibilitychange', handleVisibility, { once: true });
    window.addEventListener('blur', () => { appLaunched = true; }, { once: true });

    try {
      // First attempt target app intent
      window.location.href = targetUri;
    } catch (err) {
      console.warn(`Could not launch ${appType} scheme:`, err);
      try {
        window.location.href = genericUri;
      } catch (e) {
        setAppOpenError(true);
      }
    }

    // Fallback: If browser is still active after 1.5s and appType wasn't generic, try generic intent
    setTimeout(() => {
      if (!appLaunched && !document.hidden && appType !== 'generic') {
        try {
          window.location.href = genericUri;
        } catch (e) {}
      }
    }, 1500);

    // If still active after 2.8s, prompt user to use QR or manual copy
    setTimeout(() => {
      document.removeEventListener('visibilitychange', handleVisibility);
      if (!appLaunched && !document.hidden) {
        setAppOpenError(true);
      }
    }, 2800);
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `Infinity-UPI-QR-${orderId}.png`;
    a.click();
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-[#071A2F]/10 overflow-hidden">
      {/* Top Header Bar */}
      <div className="bg-[#FAF8F4] px-4 sm:px-8 py-5 sm:py-6 border-b border-[#071A2F]/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-[10px] font-black tracking-widest text-[#071A2F] uppercase bg-white px-2.5 py-0.5 rounded-md border border-[#071A2F]/10 shadow-2xs">
              Verified UPI Payment
            </span>
            <span className="text-xs text-[#687386] font-mono">Order #{orderId}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#071A2F] tracking-tight">
            Pay with UPI
          </h2>
          <div className="flex items-center gap-1.5 mt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-semibold text-[#071A2F]">
              {MERCHANT_NAME}
            </span>
            <span className="text-[11px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">
              Verified Merchant
            </span>
          </div>
        </div>

        {/* Total Amount Badge */}
        <div className="bg-white sm:bg-emerald-50/70 p-3.5 sm:px-5 sm:py-3 rounded-2xl border border-emerald-200/80 flex sm:flex-col justify-between items-center sm:items-end shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-900/80">Total Payable</p>
          <p className="text-2xl sm:text-3xl font-black text-emerald-800 tracking-tight">
            ₹{formattedDisplayAmount}
          </p>
        </div>
      </div>

      <div className="p-4 sm:p-8">
        
        {/* Navigation Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-1 bg-[#F4F5F7] rounded-2xl max-w-xl mx-auto mb-6 sm:mb-8 border border-gray-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => { setActiveTab('apps'); setAppOpenError(false); }}
            className={`py-2.5 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'apps'
                ? 'bg-white text-[#071A2F] shadow-xs'
                : 'text-[#687386] hover:text-[#071A2F]'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>UPI Apps</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('dynamic_qr'); setAppOpenError(false); }}
            className={`py-2.5 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'dynamic_qr'
                ? 'bg-white text-[#071A2F] shadow-xs'
                : 'text-[#687386] hover:text-[#071A2F]'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Amount QR</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('official_qr'); setAppOpenError(false); }}
            className={`py-2.5 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'official_qr'
                ? 'bg-white text-[#071A2F] shadow-xs'
                : 'text-[#687386] hover:text-[#071A2F]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#5f259f]" />
            <span>PhonePe QR</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('manual'); setAppOpenError(false); }}
            className={`py-2.5 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'manual'
                ? 'bg-white text-[#071A2F] shadow-xs'
                : 'text-[#687386] hover:text-[#071A2F]'
            }`}
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy UPI</span>
          </button>
        </div>

        {/* Return from App Alert / Guidance */}
        {hasAttemptedAppPay && (
          <div className="max-w-lg mx-auto mb-6 p-4 sm:p-5 bg-blue-50/80 border border-blue-200 rounded-2xl text-left space-y-3">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-blue-950">
                  Completing your payment in UPI app?
                </h4>
                <p className="text-xs text-blue-900/80 mt-0.5 leading-relaxed">
                  If your UPI app opened, finish the payment and enter your UPI PIN. When done, enter your 12-digit UTR/reference number below and tap <strong>"Confirm Payment"</strong>.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleLaunchApp('phonepe')}
                className="bg-[#5f259f] text-white text-xs font-bold py-2 px-3 rounded-xl cursor-pointer hover:opacity-90"
              >
                Reopen PhonePe
              </button>
              <button
                type="button"
                onClick={() => handleLaunchApp('gpay')}
                className="bg-[#1a73e8] text-white text-xs font-bold py-2 px-3 rounded-xl cursor-pointer hover:opacity-90"
              >
                Reopen GPay
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('dynamic_qr')}
                className="bg-white border border-gray-300 text-[#071A2F] text-xs font-bold py-2 px-3 rounded-xl cursor-pointer hover:bg-gray-50"
              >
                Scan QR Instead
              </button>
            </div>
          </div>
        )}

        {/* ================= TAB 1: ONE-TAP UPI APPS ================= */}
        {activeTab === 'apps' && (
          <div className="max-w-md mx-auto space-y-4">
            <div className="text-center space-y-1 mb-2">
              <h3 className="text-base sm:text-lg font-bold text-[#071A2F]">
                Tap Your Preferred UPI App
              </h3>
              <p className="text-xs text-[#687386]">
                Opens your app directly with recipient <strong className="text-[#071A2F]">SINGIREDDY JASHWANTH</strong> and exact amount <strong className="text-emerald-700">₹{formattedDisplayAmount}</strong> prefilled.
              </p>
            </div>

            {/* Direct PhonePe Button */}
            <button
              type="button"
              onClick={() => handleLaunchApp('phonepe')}
              className="w-full bg-[#5f259f] hover:bg-[#4d1d82] text-white py-3.5 px-4 rounded-2xl font-bold text-sm shadow-sm flex items-center justify-between transition-all min-h-[50px] cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#5f259f] font-black text-sm shadow-xs">
                  पे
                </div>
                <div className="text-left">
                  <div className="text-sm font-extrabold leading-none">Pay with PhonePe</div>
                  <div className="text-[10px] text-white/80 font-normal mt-0.5">Instant transfer to 8019212948@axl</div>
                </div>
              </div>
              <span className="text-sm font-black bg-white/20 px-2 py-1 rounded-lg">₹{formattedDisplayAmount}</span>
            </button>

            {/* Direct Google Pay Button */}
            <button
              type="button"
              onClick={() => handleLaunchApp('gpay')}
              className="w-full bg-[#071A2F] hover:bg-[#0B2748] text-white py-3.5 px-4 rounded-2xl font-bold text-sm shadow-sm flex items-center justify-between transition-all min-h-[50px] cursor-pointer border border-gray-700"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-black text-xs text-blue-600 shadow-xs">
                  G<span className="text-red-500">P</span><span className="text-yellow-500">a</span><span className="text-green-500">y</span>
                </div>
                <div className="text-left">
                  <div className="text-sm font-extrabold leading-none">Pay with Google Pay</div>
                  <div className="text-[10px] text-gray-300 font-normal mt-0.5">Secure bank-to-bank transfer</div>
                </div>
              </div>
              <span className="text-sm font-black bg-white/10 px-2 py-1 rounded-lg">₹{formattedDisplayAmount}</span>
            </button>

            {/* Direct Paytm Button */}
            <button
              type="button"
              onClick={() => handleLaunchApp('paytm')}
              className="w-full bg-[#002e6e] hover:bg-[#002252] text-white py-3.5 px-4 rounded-2xl font-bold text-sm shadow-sm flex items-center justify-between transition-all min-h-[50px] cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-black text-[10px] text-[#00b9f5] shadow-xs">
                  Paytm
                </div>
                <div className="text-left">
                  <div className="text-sm font-extrabold leading-none">Pay with Paytm UPI</div>
                  <div className="text-[10px] text-cyan-200 font-normal mt-0.5">Paytm / Bank account</div>
                </div>
              </div>
              <span className="text-sm font-black bg-white/20 px-2 py-1 rounded-lg">₹{formattedDisplayAmount}</span>
            </button>

            {/* Any UPI App Button */}
            <button
              type="button"
              onClick={() => handleLaunchApp('generic')}
              className="w-full bg-[#F4F5F7] hover:bg-[#E9EBEF] text-[#071A2F] py-3.5 px-4 rounded-2xl font-bold text-sm border border-gray-300 flex items-center justify-between transition-all min-h-[50px] cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center font-bold text-xs text-[#071A2F]">
                  UPI
                </div>
                <div className="text-left">
                  <div className="text-sm font-extrabold leading-none">Other UPI Apps</div>
                  <div className="text-[10px] text-[#687386] font-normal mt-0.5">BHIM, Cred, Navi, Amazon Pay & more</div>
                </div>
              </div>
              <span className="text-sm font-black text-[#071A2F]">₹{formattedDisplayAmount} →</span>
            </button>

            {/* Error Message if device cannot open UPI link */}
            {appOpenError && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left">
                <div className="flex items-start gap-2.5">
                  <HelpCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 text-xs">
                    <p className="font-bold text-amber-950">
                      UPI App Not Responding?
                    </p>
                    <p className="text-amber-900 mt-1">
                      Some mobile browsers restrict direct app links. You can pay with 100% guarantee by:
                    </p>
                    <div className="mt-2 space-y-1.5 font-medium text-amber-950">
                      <p>1. Copying our UPI ID <strong className="font-mono bg-white px-1.5 py-0.5 rounded border border-amber-300">{MERCHANT_UPI_ID}</strong></p>
                      <p>2. Or opening PhonePe / GPay and paying to mobile number <strong className="font-mono bg-white px-1.5 py-0.5 rounded border border-amber-300">{MERCHANT_PHONE}</strong></p>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        type="button"
                        onClick={() => setActiveTab('dynamic_qr')}
                        className="bg-[#071A2F] text-white text-xs font-bold px-3 py-1.5 rounded-lg"
                      >
                        SCAN QR CODE
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopyText(MERCHANT_UPI_ID, 'err_upi')}
                        className="bg-white border border-amber-300 text-[#071A2F] text-xs font-bold px-3 py-1.5 rounded-lg"
                      >
                        {copiedId === 'err_upi' ? '✓ COPIED' : 'COPY UPI ID'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 2: DYNAMIC AMOUNT QR CODE ================= */}
        {activeTab === 'dynamic_qr' && (
          <div className="max-w-md mx-auto space-y-5">
            <div className="text-center space-y-1">
              <h3 className="text-base sm:text-lg font-bold text-[#071A2F]">
                Scan with Any UPI App
              </h3>
              <p className="text-xs text-[#687386]">
                Point your camera or open scanner in PhonePe, GPay, Paytm or BHIM
              </p>
            </div>

            {/* Dynamic QR Code Canvas */}
            <div className="flex justify-center">
              <div className="relative p-4 bg-white border-2 border-[#071A2F]/15 rounded-3xl shadow-sm inline-block">
                {qrLoading ? (
                  <div className="w-56 h-56 sm:w-64 sm:h-64 flex flex-col items-center justify-center bg-gray-50 rounded-2xl">
                    <div className="w-8 h-8 border-3 border-[#071A2F] border-t-transparent rounded-full animate-spin mb-2" />
                    <p className="text-xs text-[#687386]">Generating secure QR...</p>
                  </div>
                ) : qrDataUrl ? (
                  <div className="relative">
                    <img 
                      src={qrDataUrl} 
                      alt={`UPI QR Code for ₹${formattedDisplayAmount}`}
                      className="w-56 h-56 sm:w-64 sm:h-64 object-contain rounded-xl"
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="bg-white/95 px-2 py-0.5 rounded shadow-xs border border-gray-200">
                        <span className="text-[10px] font-black tracking-wider text-[#071A2F]">UPI</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-56 h-56 flex items-center justify-center text-xs text-red-500">
                    Failed to render QR code
                  </div>
                )}
              </div>
            </div>

            {/* Payee Info & Quick Download */}
            <div className="bg-[#FAF8F4] border border-[#071A2F]/10 rounded-2xl p-3.5 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-[#687386]">
                <span>Payee:</span>
                <span className="font-bold text-[#071A2F]">{MERCHANT_NAME}</span>
              </div>
              <div className="flex items-center justify-between text-[#687386]">
                <span>Amount:</span>
                <span className="font-black text-emerald-700 text-sm">₹{formattedDisplayAmount}</span>
              </div>
              <div className="flex items-center justify-between text-[#687386]">
                <span>UPI ID:</span>
                <span className="font-mono text-[#071A2F] font-bold">{MERCHANT_UPI_ID}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleDownloadQr}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-[#071A2F] py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save QR to Gallery</span>
              </button>
              {isMobileDevice && (
                <button
                  type="button"
                  onClick={() => setActiveTab('apps')}
                  className="flex-1 bg-[#071A2F] hover:bg-[#123C69] text-white py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Open UPI App</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 3: OFFICIAL PHONEPE STANDING QR ================= */}
        {activeTab === 'official_qr' && (
          <div className="max-w-md mx-auto space-y-4 text-center">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 bg-[#5f259f]/10 text-[#5f259f] px-3 py-1 rounded-full text-xs font-bold mb-1">
                <span>PhonePe Official Merchant Standee</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#071A2F]">
                SINGIREDDY JASHWANTH
              </h3>
              <p className="text-xs text-[#687386]">
                Direct photo of our verified PhonePe QR standee. Scan or upload from gallery in PhonePe.
              </p>
            </div>

            {/* Standee Image Frame */}
            <div className="p-3 bg-black rounded-3xl max-w-[280px] mx-auto shadow-md border border-gray-800">
              <img 
                src="/images/phonepe-qr.png" 
                alt="PhonePe Accepted Here — Singireddy Jashwanth" 
                className="w-full h-auto rounded-2xl object-cover"
              />
            </div>

            <div className="bg-[#FAF8F4] border border-[#071A2F]/10 rounded-2xl p-3 text-xs text-[#071A2F] space-y-1 text-left">
              <p className="font-bold text-[#071A2F]">How to use this standee:</p>
              <p className="text-[#687386] text-[11px]">1. Open PhonePe $\rightarrow$ Tap the Scanner icon at the top right</p>
              <p className="text-[#687386] text-[11px]">2. Point camera at this screen OR choose this screenshot from gallery</p>
              <p className="text-[#687386] text-[11px]">3. Enter amount <strong className="text-emerald-700">₹{formattedDisplayAmount}</strong> and complete payment</p>
            </div>
          </div>
        )}

        {/* ================= TAB 4: MANUAL TRANSFER & COPY UPI ================= */}
        {activeTab === 'manual' && (
          <div className="max-w-md mx-auto space-y-4">
            <div className="text-center space-y-1">
              <h3 className="text-base sm:text-lg font-bold text-[#071A2F]">
                Manual Transfer (100% Reliable)
              </h3>
              <p className="text-xs text-[#687386]">
                Open any UPI app, choose "To UPI ID" or "To Mobile Number", and transfer ₹{formattedDisplayAmount}.
              </p>
            </div>

            {/* Primary PhonePe UPI ID */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#071A2F] uppercase tracking-wider">
                  Primary UPI ID (PhonePe Axis)
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                  Recommended
                </span>
              </div>
              <div className="flex items-center justify-between bg-white border border-gray-300 rounded-xl p-2.5">
                <span className="font-mono text-sm font-black text-[#071A2F] select-all">
                  {MERCHANT_UPI_ID}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyText(MERCHANT_UPI_ID, 'vpa_primary')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    copiedId === 'vpa_primary'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#071A2F] text-white hover:bg-[#123C69]'
                  }`}
                >
                  {copiedId === 'vpa_primary' ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <p className="text-[11px] text-[#687386]">Beneficiary Name: <strong>{MERCHANT_NAME}</strong></p>
            </div>

            {/* Pay to Mobile Number */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#071A2F] uppercase tracking-wider">
                  Pay to Mobile Number
                </span>
                <span className="text-[10px] text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded">
                  PhonePe / GPay
                </span>
              </div>
              <div className="flex items-center justify-between bg-white border border-gray-300 rounded-xl p-2.5">
                <span className="font-mono text-sm font-black text-[#071A2F] select-all">
                  +91 {MERCHANT_PHONE}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyText(MERCHANT_PHONE, 'phone')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    copiedId === 'phone'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#071A2F] text-white hover:bg-[#123C69]'
                  }`}
                >
                  {copiedId === 'phone' ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <p className="text-[11px] text-[#687386]">Open PhonePe $\rightarrow$ Select "To Mobile Number" $\rightarrow$ Type 8985993948</p>
            </div>

            {/* Alternate UPI ID */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3.5 space-y-2">
              <span className="text-[11px] font-bold text-[#071A2F] uppercase tracking-wider block">
                Alternate UPI ID (PhonePe Yes Bank)
              </span>
              <div className="flex items-center justify-between bg-white border border-gray-300 rounded-xl p-2.5">
                <span className="font-mono text-sm font-black text-[#071A2F] select-all">
                  {ALT_MERCHANT_UPI_ID}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyText(ALT_MERCHANT_UPI_ID, 'vpa_alt')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    copiedId === 'vpa_alt'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white border border-gray-300 text-[#071A2F] hover:bg-gray-100'
                  }`}
                >
                  {copiedId === 'vpa_alt' ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= TRANSACTION UTR & CONFIRMATION ================= */}
        <div className="max-w-md mx-auto mt-8 pt-6 border-t border-gray-200 space-y-4">
          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#071A2F]">
              Enter UPI UTR / Reference No. <span className="text-gray-400 font-normal lowercase">(optional for faster check)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. 427812345678 (12 digits from your UPI receipt)"
              value={utrNumber}
              onChange={(e) => setUtrNumber(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
              maxLength={20}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-sm font-mono text-[#071A2F]"
            />
          </div>

          <button
            type="button"
            onClick={onConfirmPayment}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 px-6 rounded-2xl font-black text-sm sm:text-base shadow-md flex items-center justify-center gap-2 min-h-[52px] active:scale-[0.99] cursor-pointer transition-all"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>I Have Paid ₹{formattedDisplayAmount} — Confirm Order</span>
          </button>

          <div className="flex items-center justify-center gap-4 text-xs font-semibold text-[#687386] pt-1">
            <a 
              href={`https://wa.me/918985993948?text=${encodeURIComponent(`Hi Infinity Customizations, I am making a UPI payment of ₹${formattedDisplayAmount} for Order #${orderId}. Please help verify.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-emerald-800 hover:text-emerald-950 font-bold"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>WhatsApp Payment Support (+91 89859 93948)</span>
            </a>
          </div>

          <div className="p-3 bg-[#FAF8F4] border border-[#071A2F]/10 rounded-2xl text-[11px] text-[#687386] text-center leading-relaxed">
            <Lock className="w-3.5 h-3.5 text-emerald-700 inline-block mr-1" />
            Once you confirm, your order is instantly placed in <strong>verification pending</strong> status. Our team matches the UTR and contacts you on WhatsApp with your design preview.
          </div>
        </div>

      </div>
    </div>
  );
};

export default UpiPaymentView;
