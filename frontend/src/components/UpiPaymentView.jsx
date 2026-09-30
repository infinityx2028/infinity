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
  ExternalLink 
} from 'lucide-react';

export const MERCHANT_UPI_ID = 'Q489570312@ybl';
export const MERCHANT_NAME = 'Infinity Customizations';

/**
 * Builds a compliant UPI payment URI with dynamically encoded values
 */
export const buildUpiUri = ({ amount, orderId }) => {
  const numAmount = Number(amount);
  const formattedAmount = Number.isFinite(numAmount) ? numAmount.toFixed(2) : String(amount);
  const encodedName = encodeURIComponent(MERCHANT_NAME);
  const encodedNote = encodeURIComponent(`Order ${orderId}`);
  const encodedRef = encodeURIComponent(orderId);

  // Conceptually & standard UPI URI format:
  // upi://pay?pa=Q489570312@ybl&pn=Infinity%20Customizations&am={AMOUNT}&cu=INR&tn={ORDER_REFERENCE}&tr={ORDER_REFERENCE}
  return `upi://pay?pa=${MERCHANT_UPI_ID}&pn=${encodedName}&am=${formattedAmount}&cu=INR&tn=${encodedNote}&tr=${encodedRef}`;
};

const UpiPaymentView = ({ 
  orderId, 
  amount, 
  serverUpiLink, 
  onConfirmPayment 
}) => {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [qrLoading, setQrLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [appOpenError, setAppOpenError] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [activeTab, setActiveTab] = useState('auto'); // 'app' | 'qr'

  // The actual final payable amount from existing checkout
  const finalAmount = Number(amount) || 0;
  const formattedDisplayAmount = finalAmount.toLocaleString('en-IN');

  // Dynamically generated UPI URI
  const upiUri = useMemo(() => {
    if (serverUpiLink && serverUpiLink.startsWith('upi://')) {
      return serverUpiLink;
    }
    return buildUpiUri({ amount: finalAmount, orderId });
  }, [serverUpiLink, finalAmount, orderId]);

  // Detect device screen and capabilities on mount
  useEffect(() => {
    const checkMobile = () => {
      const isMobileScreen = window.innerWidth <= 768;
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isMobileUA = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
      return isMobileScreen || (hasTouch && isMobileUA);
    };

    const mobile = checkMobile();
    setIsMobileDevice(mobile);
    setActiveTab(mobile ? 'app' : 'qr');
  }, []);

  // Generate dynamic QR code matching the exact UPI URI
  useEffect(() => {
    let cancelled = false;
    setQrLoading(true);

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

    let appLaunched = false;
    const handleVisibilityChange = () => {
      if (document.hidden) {
        appLaunched = true;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange, { once: true });
    window.addEventListener('blur', () => { appLaunched = true; }, { once: true });

    try {
      // Standard deep link trigger
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
      <div className="bg-[#FAF8F4] px-6 sm:px-8 py-6 border-b border-[#071A2F]/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-black tracking-widest text-[#071A2F] uppercase bg-white px-2.5 py-0.5 rounded-md border border-[#071A2F]/10">
              UPI Instant Payment
            </span>
            <span className="text-xs text-[#687386]">Order #{orderId}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#071A2F]">
            Pay with UPI
          </h2>
          <p className="text-xs sm:text-sm text-[#687386] mt-0.5">
            Paying to: <span className="font-semibold text-[#071A2F]">{MERCHANT_NAME}</span>
          </p>
        </div>

        {/* Real Final Order Total */}
        <div className="sm:text-right bg-white sm:bg-transparent p-4 sm:p-0 rounded-2xl border sm:border-0 border-[#071A2F]/8">
          <p className="text-xs font-bold uppercase tracking-wider text-[#687386]">Total Payable Amount</p>
          <p className="text-3xl sm:text-4xl font-extrabold text-[#071A2F] tracking-tight">
            ₹{formattedDisplayAmount}
          </p>
        </div>
      </div>

      <div className="p-6 sm:p-8">
        {/* Device Mode Switcher (App Intent vs QR Code) */}
        <div className="flex items-center justify-center p-1 bg-[#F4F5F7] rounded-xl max-w-sm mx-auto mb-8 border border-gray-200">
          <button
            type="button"
            onClick={() => { setActiveTab('app'); setAppOpenError(false); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all duration-200 ${
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
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all duration-200 ${
              activeTab === 'qr'
                ? 'bg-white text-[#071A2F] shadow-xs'
                : 'text-[#687386] hover:text-[#071A2F]'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Scan QR Code</span>
          </button>
        </div>

        {/* ================= APP INTENT VIEW (Primary on Mobile) ================= */}
        {activeTab === 'app' && (
          <div className="max-w-md mx-auto space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#071A2F]/5 text-[#071A2F] mb-1">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#071A2F]">
                PAY USING ANY UPI APP
              </h3>
              <p className="text-xs sm:text-sm text-[#687386]">
                Choose your installed UPI app to pay <strong className="text-[#071A2F]">₹{formattedDisplayAmount}</strong> directly.
              </p>
            </div>

            {/* Error Message if device cannot open UPI link */}
            {appOpenError && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left animate-fadeIn">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-amber-900">
                      Couldn't open a UPI app.
                    </p>
                    <p className="text-xs text-amber-800 mt-1">
                      No compatible UPI app responded on this device. You can scan the QR code using another phone or copy our UPI ID.
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <button
                        type="button"
                        onClick={() => setActiveTab('qr')}
                        className="bg-[#071A2F] text-white text-xs font-bold px-3.5 py-1.5 rounded-lg hover:bg-[#123C69] transition-colors"
                      >
                        SHOW QR CODE
                      </button>
                      <button
                        type="button"
                        onClick={handleCopyUpiId}
                        className="bg-white border border-gray-300 text-[#071A2F] text-xs font-bold px-3.5 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        {copied ? '✓ UPI ID COPIED' : 'COPY UPI ID'}
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
              className="w-full bg-[#071A2F] hover:bg-[#123C69] text-white py-4 px-6 rounded-2xl font-bold text-base sm:text-lg shadow-lg shadow-[#071A2F]/15 flex items-center justify-center gap-3 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>PAY ₹{formattedDisplayAmount} WITH ANY UPI APP</span>
              <span className="text-white/60">→</span>
            </button>

            {/* Compatible UPI Apps list */}
            <div className="text-center pt-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#687386] mb-2">
                Supported UPI Apps
              </p>
              <p className="text-xs font-medium text-[#071A2F] tracking-wide">
                PhonePe • GPay • Paytm • BHIM • super.money • any UPI app
              </p>
            </div>

            {/* Secondary Action: Switch to QR */}
            <div className="text-center pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setActiveTab('qr')}
                className="text-xs font-bold text-[#071A2F] hover:text-[#123C69] underline underline-offset-4 transition-colors"
              >
                Prefer scanning? View dynamic QR code instead
              </button>
            </div>
          </div>
        )}

        {/* ================= QR CODE VIEW (Primary on Desktop) ================= */}
        {activeTab === 'qr' && (
          <div className="max-w-md mx-auto space-y-6">
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-[#071A2F]">
                Scan with any UPI app
              </h3>
              <p className="text-xs text-[#687386]">
                Point your phone camera or open PhonePe, GPay, Paytm or BHIM scanner
              </p>
            </div>

            {/* Dynamic QR Code Canvas */}
            <div className="flex justify-center">
              <div className="relative p-4 sm:p-5 bg-white border-2 border-[#071A2F]/15 rounded-3xl shadow-sm inline-block">
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
                      <div className="bg-white/95 px-2.5 py-1 rounded-md shadow-xs border border-gray-200">
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

            {/* Amount & Payee Badge */}
            <div className="bg-[#FAF8F4] border border-[#071A2F]/10 rounded-2xl p-4 text-center space-y-1">
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

            {/* Compatible UPI Apps list */}
            <div className="text-center">
              <p className="text-xs text-[#687386]">
                <strong className="text-[#071A2F]">PhonePe • GPay • Paytm • BHIM</strong> • other compatible UPI apps
              </p>
            </div>

            {/* If on mobile, offer direct app pay button */}
            {isMobileDevice && (
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('app')}
                  className="w-full bg-[#071A2F] hover:bg-[#123C69] text-white py-3 px-4 rounded-xl font-bold text-sm transition-colors"
                >
                  Or Open UPI App Directly on This Phone
                </button>
              </div>
            )}
          </div>
        )}

        {/* ================= COPY UPI ID SECTION ================= */}
        <div className="max-w-md mx-auto mt-8 pt-6 border-t border-gray-100">
          <p className="text-xs font-bold text-[#071A2F] uppercase tracking-wider mb-2 text-center">
            Merchant UPI ID
          </p>
          <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-2xl p-2.5 sm:p-3">
            <span className="font-mono text-xs sm:text-sm font-bold text-[#071A2F] px-2 select-all truncate">
              {MERCHANT_UPI_ID}
            </span>
            <button
              type="button"
              onClick={handleCopyUpiId}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
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
            <p className="text-[11px] text-emerald-700 font-medium text-center mt-1.5 animate-fadeIn">
              ✓ UPI ID copied to clipboard
            </p>
          ) : (
            <p className="text-[11px] text-[#687386] text-center mt-1.5">
              Do not treat copying the UPI ID as payment.
            </p>
          )}
        </div>

        {/* ================= PAYMENT INSTRUCTIONS & SECURITY ================= */}
        <div className="max-w-md mx-auto mt-6 bg-[#FAF8F4] border border-[#071A2F]/10 rounded-2xl p-5 text-xs text-[#071A2F] space-y-2.5">
          <div className="flex items-center gap-2 font-bold text-sm text-[#071A2F]">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>How to complete payment safely</span>
          </div>
          <ol className="list-decimal list-inside space-y-1.5 text-[#687386] leading-relaxed">
            <li>Open any UPI app or scan the QR code above.</li>
            <li>Verify recipient is <strong className="text-[#071A2F]">{MERCHANT_NAME}</strong> and amount is <strong className="text-[#071A2F]">₹{formattedDisplayAmount}</strong>.</li>
            <li>Enter your UPI PIN <strong>only inside your trusted UPI app</strong>.</li>
            <li>After successful payment, click <strong>"Confirm Payment"</strong> below.</li>
          </ol>
          <div className="pt-2 border-t border-[#071A2F]/8 flex items-start gap-2 text-[11px] text-amber-900 bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/60">
            <Lock className="w-3.5 h-3.5 text-amber-700 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Security Guarantee:</strong> Infinity Customizations will NEVER ask for your UPI PIN or banking passwords.
            </span>
          </div>
        </div>

        {/* ================= CONFIRM PAYMENT BUTTON ================= */}
        <div className="max-w-md mx-auto mt-8 space-y-3">
          <button
            type="button"
            onClick={onConfirmPayment}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 px-6 rounded-2xl font-bold text-base sm:text-lg shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>Confirm Payment (I Have Paid)</span>
          </button>
          <p className="text-[11px] text-[#687386] text-center leading-normal">
            Orders are placed in <strong>verification pending</strong> status until our team verifies the payment UTR. We will contact you via WhatsApp for confirmation and photos.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UpiPaymentView;
