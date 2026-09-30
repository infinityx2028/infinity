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
  ArrowLeft
} from 'lucide-react';

export const MERCHANT_UPI_ID = 'Q489570312@ybl';
export const MERCHANT_NAME = 'Infinity Customizations';

/**
 * Builds a compliant UPI payment URI with dynamically encoded values
 */
export const buildUpiUri = ({ amount, orderId }) => {
  const numAmount = Number(amount);
  const formattedAmount = Number.isFinite(numAmount) ? numAmount.toFixed(2) : String(amount);
  const cleanUpiId = MERCHANT_UPI_ID.trim();
  const cleanOrderId = String(orderId || '').trim();
  // Safe alphanumeric note without spaces or special characters
  const cleanNote = `Order-${cleanOrderId}`.replace(/[^a-zA-Z0-9_-]/g, '');
  const encodedName = encodeURIComponent(MERCHANT_NAME.trim());
  const encodedNote = encodeURIComponent(cleanNote);

  // Standard UPI URI format:
  // upi://pay?pa=Q489570312@ybl&pn=Infinity%20Customizations&am={AMOUNT}&cu=INR&tn={ORDER_NOTE}
  return `upi://pay?pa=${cleanUpiId}&pn=${encodedName}&am=${formattedAmount}&cu=INR&tn=${encodedNote}`;
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
  const [copied, setCopied] = useState(false);
  const [appOpenError, setAppOpenError] = useState(false);
  const [hasAttemptedAppPay, setHasAttemptedAppPay] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(() => {
    if (typeof window === 'undefined') return false;
    const isMobileScreen = window.innerWidth <= 768;
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isMobileUA = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
    return isMobileScreen || (hasTouch && isMobileUA);
  });
  const [activeTab, setActiveTab] = useState(() => (isMobileDevice ? 'app' : 'qr'));

  // The actual final payable amount from existing checkout
  const finalAmount = Number(amount) || 0;
  const formattedDisplayAmount = finalAmount.toLocaleString('en-IN');

  // Dynamically generated compliant UPI URI
  const upiUri = useMemo(() => {
    if (serverUpiLink && serverUpiLink.startsWith('upi://')) {
      return serverUpiLink;
    }
    return buildUpiUri({ amount: finalAmount, orderId });
  }, [serverUpiLink, finalAmount, orderId]);

  // Generate dynamic QR code matching the exact UPI URI
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

  // Listen to window focus / visibility change after attempting app pay
  // CRITICAL RULE: Returning to browser does NOT mean payment succeeded!
  useEffect(() => {
    const handleReturnToBrowser = () => {
      if (hasAttemptedAppPay && !document.hidden) {
        // App opened and user returned to browser — keep order safe in unconfirmed state
      }
    };

    window.addEventListener('focus', handleReturnToBrowser);
    document.addEventListener('visibilitychange', handleReturnToBrowser);

    return () => {
      window.removeEventListener('focus', handleReturnToBrowser);
      document.removeEventListener('visibilitychange', handleReturnToBrowser);
    };
  }, [hasAttemptedAppPay]);

  // Copy UPI ID to clipboard
  const handleCopyUpiId = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(MERCHANT_UPI_ID);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = MERCHANT_UPI_ID;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.warn('Clipboard copy error:', err);
    }
  };

  // Launch UPI App Intent on mobile
  const handlePayWithApp = () => {
    setAppOpenError(false);
    setHasAttemptedAppPay(true);

    let appLaunched = false;
    const handleVisibilityChange = () => {
      if (document.hidden) {
        appLaunched = true;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange, { once: true });
    window.addEventListener('blur', () => { appLaunched = true; }, { once: true });

    try {
      window.location.href = upiUri;
    } catch (err) {
      console.error('Failed to launch UPI URI:', err);
      setAppOpenError(true);
    }

    // If browser remains visible after 1.8s, app handler wasn't available
    setTimeout(() => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (!appLaunched && !document.hidden) {
        setAppOpenError(true);
      }
    }, 1800);
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-[#071A2F]/10 overflow-hidden">
      {/* Header Bar */}
      <div className="bg-[#FAF8F4] px-4 sm:px-8 py-5 sm:py-6 border-b border-[#071A2F]/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black tracking-widest text-[#071A2F] uppercase bg-white px-2 py-0.5 rounded-md border border-[#071A2F]/10">
              UPI Instant Payment
            </span>
            <span className="text-xs text-[#687386]">Order #{orderId}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#071A2F]">
            Pay with UPI
          </h2>
          <p className="text-xs text-[#687386] mt-0.5">
            Paying to: <span className="font-semibold text-[#071A2F]">{MERCHANT_NAME}</span>
          </p>
        </div>

        {/* Real Final Order Total */}
        <div className="sm:text-right bg-white sm:bg-transparent p-3 sm:p-0 rounded-2xl border sm:border-0 border-[#071A2F]/8 flex sm:flex-col justify-between items-center sm:items-end">
          <p className="text-xs font-bold uppercase tracking-wider text-[#687386]">Total Payable</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#071A2F] tracking-tight">
            ₹{formattedDisplayAmount}
          </p>
        </div>
      </div>

      <div className="p-4 sm:p-8">
        
        {/* Device Mode Switcher (App Intent vs QR Code) */}
        <div className="flex items-center justify-center p-1 bg-[#F4F5F7] rounded-xl max-w-sm mx-auto mb-6 sm:mb-8 border border-gray-200">
          <button
            type="button"
            onClick={() => { setActiveTab('app'); setAppOpenError(false); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all duration-200 min-h-[40px] cursor-pointer ${
              activeTab === 'app'
                ? 'bg-white text-[#071A2F] shadow-xs'
                : 'text-[#687386] hover:text-[#071A2F]'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Pay via UPI App</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('qr'); setAppOpenError(false); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all duration-200 min-h-[40px] cursor-pointer ${
              activeTab === 'qr'
                ? 'bg-white text-[#071A2F] shadow-xs'
                : 'text-[#687386] hover:text-[#071A2F]'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Scan QR Code</span>
          </button>
        </div>

        {/* ================= PAYMENT RETURN / UNCONFIRMED STATE ================= */}
        {hasAttemptedAppPay && (
          <div className="max-w-md mx-auto mb-6 p-4 sm:p-5 bg-amber-50/80 border border-amber-200 rounded-2xl text-left space-y-3">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-amber-950">
                  PAYMENT NOT CONFIRMED
                </h4>
                <p className="text-xs text-amber-900/80 mt-0.5 leading-relaxed">
                  We couldn't confirm this payment yet. If you returned from your UPI app, please choose an action below:
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handlePayWithApp}
                className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#071A2F] hover:bg-[#0B2748] text-white text-xs font-bold py-2.5 px-3 rounded-xl min-h-[44px] cursor-pointer transition-colors"
              >
                <RefreshCw size={13} />
                <span>TRY UPI AGAIN</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('qr')}
                className="flex-1 inline-flex items-center justify-center gap-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-[#071A2F] text-xs font-bold py-2.5 px-3 rounded-xl min-h-[44px] cursor-pointer transition-colors"
              >
                <QrCode size={13} />
                <span>SHOW UPI QR</span>
              </button>
            </div>

            {onChangePaymentMethod && (
              <button
                type="button"
                onClick={onChangePaymentMethod}
                className="w-full text-center text-xs font-semibold text-amber-900 hover:text-black pt-1 underline cursor-pointer"
              >
                CHOOSE ANOTHER PAYMENT METHOD
              </button>
            )}
          </div>
        )}

        {/* ================= APP INTENT VIEW ================= */}
        {activeTab === 'app' && (
          <div className="max-w-md mx-auto space-y-5">
            <div className="text-center space-y-1.5">
              <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-[#071A2F]/5 text-[#071A2F] mb-1">
                <Smartphone className="w-5 h-5" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#071A2F]">
                PAY USING ANY UPI APP
              </h3>
              <p className="text-xs text-[#687386]">
                Tap below to choose your installed UPI app and pay <strong className="text-[#071A2F]">₹{formattedDisplayAmount}</strong> directly.
              </p>
            </div>

            {/* Error Message if device cannot open UPI link */}
            {appOpenError && (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-left">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 text-xs">
                    <p className="font-bold text-rose-900">
                      Couldn't open a UPI app.
                    </p>
                    <p className="text-rose-800 mt-1">
                      No compatible UPI app responded. You can scan the QR code using another phone or copy our UPI ID.
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-2.5">
                      <button
                        type="button"
                        onClick={() => setActiveTab('qr')}
                        className="bg-[#071A2F] text-white text-xs font-bold px-3 py-1.5 rounded-lg"
                      >
                        SHOW QR CODE
                      </button>
                      <button
                        type="button"
                        onClick={handleCopyUpiId}
                        className="bg-white border border-gray-300 text-[#071A2F] text-xs font-bold px-3 py-1.5 rounded-lg"
                      >
                        {copied ? '✓ COPIED' : 'COPY UPI ID'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Primary Mobile CTA Button */}
            <button
              type="button"
              onClick={handlePayWithApp}
              className="w-full bg-[#071A2F] hover:bg-[#123C69] active:bg-[#071A2F] text-white py-4 px-6 rounded-2xl font-bold text-sm sm:text-base shadow-md flex items-center justify-center gap-2 transition-all min-h-[48px] cursor-pointer"
            >
              <span>PAY ₹{formattedDisplayAmount} WITH ANY UPI APP</span>
              <span className="text-white/60">→</span>
            </button>

            {/* Compatible UPI Apps list */}
            <div className="text-center pt-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#687386] mb-1">
                Supported UPI Apps
              </p>
              <p className="text-xs font-medium text-[#071A2F] tracking-wide">
                PhonePe • Google Pay • Paytm • BHIM • Cred • any UPI app
              </p>
            </div>

            {/* Secondary Action: Switch to QR */}
            <div className="text-center pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setActiveTab('qr')}
                className="text-xs font-bold text-[#071A2F] hover:text-[#123C69] underline underline-offset-4"
              >
                Prefer scanning? View dynamic QR code instead
              </button>
            </div>
          </div>
        )}

        {/* ================= QR CODE VIEW ================= */}
        {activeTab === 'qr' && (
          <div className="max-w-md mx-auto space-y-5">
            <div className="text-center space-y-1">
              <h3 className="text-base sm:text-lg font-bold text-[#071A2F]">
                Scan with any UPI app
              </h3>
              <p className="text-xs text-[#687386]">
                Point your phone camera or open PhonePe, GPay, Paytm or BHIM scanner
              </p>
            </div>

            {/* Dynamic QR Code Canvas */}
            <div className="flex justify-center">
              <div className="relative p-3 sm:p-4 bg-white border-2 border-[#071A2F]/15 rounded-3xl shadow-sm inline-block">
                {qrLoading ? (
                  <div className="w-52 h-52 sm:w-60 sm:h-60 flex flex-col items-center justify-center bg-gray-50 rounded-2xl">
                    <div className="w-8 h-8 border-3 border-[#071A2F] border-t-transparent rounded-full animate-spin mb-2" />
                    <p className="text-xs text-[#687386]">Generating secure QR...</p>
                  </div>
                ) : qrDataUrl ? (
                  <div className="relative">
                    <img 
                      src={qrDataUrl} 
                      alt={`UPI QR Code for ₹${formattedDisplayAmount}`}
                      className="w-52 h-52 sm:w-60 sm:h-60 object-contain rounded-xl"
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="bg-white/95 px-2 py-0.5 rounded shadow-xs border border-gray-200">
                        <span className="text-[10px] font-black tracking-wider text-[#071A2F]">UPI</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-52 h-52 flex items-center justify-center text-xs text-red-500">
                    Failed to render QR code
                  </div>
                )}
              </div>
            </div>

            {/* Amount & Payee Badge */}
            <div className="bg-[#FAF8F4] border border-[#071A2F]/10 rounded-2xl p-3.5 text-center space-y-1">
              <div className="flex items-center justify-between text-xs text-[#687386]">
                <span>Payee:</span>
                <span className="font-bold text-[#071A2F]">{MERCHANT_NAME}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-[#687386]">
                <span>Amount:</span>
                <span className="font-bold text-emerald-700 text-sm">₹{formattedDisplayAmount}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-[#687386]">
                <span>Reference:</span>
                <span className="font-mono text-[#071A2F]">{orderId}</span>
              </div>
            </div>

            {/* If on mobile, offer direct app pay button */}
            {isMobileDevice && (
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('app')}
                  className="w-full bg-[#071A2F] hover:bg-[#123C69] text-white py-3 px-4 rounded-xl font-bold text-xs sm:text-sm min-h-[44px]"
                >
                  Or Open UPI App Directly on This Phone
                </button>
              </div>
            )}
          </div>
        )}

        {/* ================= COPY UPI ID SECTION ================= */}
        <div className="max-w-md mx-auto mt-6 pt-5 border-t border-gray-100">
          <p className="text-[11px] font-bold text-[#071A2F] uppercase tracking-wider mb-2 text-center">
            Merchant UPI ID
          </p>
          <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-2xl p-2 sm:p-2.5">
            <span className="font-mono text-xs sm:text-sm font-bold text-[#071A2F] px-2 select-all truncate">
              {MERCHANT_UPI_ID}
            </span>
            <button
              type="button"
              onClick={handleCopyUpiId}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all min-h-[38px] ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white border border-gray-300 text-[#071A2F] hover:bg-gray-100'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          {copied ? (
            <p className="text-[11px] text-emerald-700 font-medium text-center mt-1">
              ✓ UPI ID copied to clipboard
            </p>
          ) : (
            <p className="text-[10px] text-[#687386] text-center mt-1">
              Copying UPI ID does not mark payment. Please complete transfer in your UPI app.
            </p>
          )}
        </div>

        {/* ================= INSTRUCTIONS & SECURITY ================= */}
        <div className="max-w-md mx-auto mt-5 bg-[#FAF8F4] border border-[#071A2F]/10 rounded-2xl p-4 text-xs text-[#071A2F] space-y-2">
          <div className="flex items-center gap-2 font-bold text-xs text-[#071A2F]">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>How to complete payment safely</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-[#687386] text-[11px] leading-relaxed">
            <li>Open any UPI app or scan the QR code above.</li>
            <li>Verify recipient is <strong className="text-[#071A2F]">{MERCHANT_NAME}</strong> and amount is <strong className="text-[#071A2F]">₹{formattedDisplayAmount}</strong>.</li>
            <li>Enter your UPI PIN <strong>only inside your trusted UPI app</strong>.</li>
            <li>After successful payment, click <strong>"Confirm Payment (I Have Paid)"</strong> below.</li>
          </ol>
          <div className="pt-2 border-t border-[#071A2F]/8 flex items-start gap-1.5 text-[10px] text-amber-900 bg-amber-50/70 p-2 rounded-xl border border-amber-200/60">
            <Lock className="w-3.5 h-3.5 text-amber-700 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Security Guarantee:</strong> Infinity Customizations will NEVER ask for your UPI PIN or banking passwords.
            </span>
          </div>
        </div>

        {/* ================= CONFIRM PAYMENT BUTTON ================= */}
        <div className="max-w-md mx-auto mt-6 space-y-2.5">
          <button
            type="button"
            onClick={onConfirmPayment}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 sm:py-4 px-6 rounded-2xl font-bold text-sm sm:text-base shadow-md flex items-center justify-center gap-2 min-h-[48px] active:scale-[0.99] cursor-pointer"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>Confirm Payment (I Have Paid)</span>
          </button>
          <p className="text-[10px] sm:text-[11px] text-[#687386] text-center leading-normal">
            Orders are placed in <strong>verification pending</strong> status until our team verifies the payment UTR. We will contact you via WhatsApp for confirmation and photos.
          </p>
        </div>

      </div>
    </div>
  );
};

export default UpiPaymentView;
