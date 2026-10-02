import React, { useState, useEffect, useMemo } from 'react';
import QRCode from 'qrcode';
import { 
  QrCode, 
  Copy, 
  ShieldCheck, 
  CheckCircle2, 
  Download,
  Info,
  Lock,
  MessageCircle,
  Sparkles,
  Smartphone,
  Check,
  CreditCard,
  ChevronRight,
  BadgeCheck,
  RefreshCw,
  HelpCircle,
  ArrowRight
} from 'lucide-react';

import { MERCHANT_UPI_ID, MERCHANT_NAME, ALT_MERCHANT_UPI_ID, MERCHANT_PHONE, buildUpiQrData } from '../utils/upi';

const UpiPaymentView = ({ 
  orderId, 
  amount, 
  onConfirmPayment
}) => {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [qrLoading, setQrLoading] = useState(true);
  const [copiedId, setCopiedId] = useState('');
  const [utrNumber, setUtrNumber] = useState('');
  const [mobileTab, setMobileTab] = useState('qr'); // 'qr' | 'upi_id'

  const finalAmount = Number(amount) || 0;
  const formattedDisplayAmount = finalAmount.toLocaleString('en-IN');

  // Build clean UPI data string strictly for QR generation
  const qrString = useMemo(() => {
    return buildUpiQrData({ amount: finalAmount, orderId });
  }, [finalAmount, orderId]);

  // Generate dynamic QR code matching exact amount & verified merchant VPA
  useEffect(() => {
    let cancelled = false;

    QRCode.toDataURL(qrString, {
      width: 360,
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
        console.error('Failed to generate UPI QR code:', err);
        if (!cancelled) {
          setQrLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [qrString]);

  // Tactile Copy helper with animated feedback
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
      setTimeout(() => setCopiedId(''), 3000);
    } catch (err) {
      console.warn('Clipboard copy error:', err);
    }
  };

  // Download QR code image to gallery for mobile scanning
  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `Infinity-UPI-QR-${orderId || 'payment'}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-[#071A2F]/5 border border-[#071A2F]/10 overflow-hidden">
      
      {/* ================= LUXURY HEADER ================= */}
      <div className="relative bg-gradient-to-br from-[#071A2F] via-[#0D243F] to-[#123C69] text-white p-6 sm:p-8 overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-black tracking-widest uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3 py-1 rounded-full backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Verified Merchant Payment
              </span>
              <span className="text-xs text-white/60 font-mono">
                Order #{orderId}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              UPI Payment
            </h2>
            <div className="flex items-center gap-2 mt-1.5 text-white/80 text-xs sm:text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span className="font-semibold">{MERCHANT_NAME}</span>
              <span className="text-white/40">•</span>
              <span className="text-white/60">Zero Gateway Surcharge</span>
            </div>
          </div>

          {/* Amount Badge */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:px-6 sm:py-3.5 flex items-center justify-between md:flex-col md:items-end shadow-inner">
            <span className="text-[11px] font-bold uppercase tracking-wider text-white/70">
              Total Payable
            </span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight">
              ₹{formattedDisplayAmount}
            </div>
          </div>
        </div>
      </div>

      {/* ================= NOTICE & TESTING GUIDANCE ================= */}
      <div className="px-5 sm:px-8 pt-6 pb-2">
        <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3.5 sm:p-4 text-left">
          <div className="flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-950 space-y-0.5">
              <p className="font-bold text-amber-900">
                Official UPI QR & Direct VPA Payment:
              </p>
              <p className="text-amber-800 leading-relaxed">
                Scan the QR code with any UPI app scanner (PhonePe, GPay, Paytm, BHIM) or copy the UPI ID below to pay directly without browser link redirects. 
                <span className="text-amber-900/80 block mt-1">
                  <em>(Testing tip: Banks block self-transfers if you try paying from the same phone number or bank account linked to {MERCHANT_UPI_ID}. Test using an alternate account.)</em>
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MOBILE VIEW TOGGLE (QR vs UPI ID) ================= */}
      <div className="px-5 sm:px-8 pt-4 md:hidden">
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#F4F5F7] rounded-2xl border border-gray-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => setMobileTab('qr')}
            className={`py-2.5 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              mobileTab === 'qr'
                ? 'bg-[#071A2F] text-white shadow-xs font-extrabold'
                : 'text-[#687386] hover:text-[#071A2F]'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Scan QR Code</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileTab('upi_id')}
            className={`py-2.5 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              mobileTab === 'upi_id'
                ? 'bg-[#071A2F] text-white shadow-xs font-extrabold'
                : 'text-[#687386] hover:text-[#071A2F]'
            }`}
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy UPI ID</span>
          </button>
        </div>
      </div>

      {/* ================= MAIN CONTENT: QR CODE & UPI ID CARDS ================= */}
      <div className="p-5 sm:p-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

          {/* ----------------- COLUMN 1: DYNAMIC AMOUNT QR CODE ----------------- */}
          <div className={`${mobileTab === 'upi_id' ? 'hidden md:block' : 'block'}`}>
            <div className="bg-gradient-to-b from-[#FAF8F4] to-white border-2 border-[#071A2F]/10 rounded-3xl p-6 sm:p-7 text-center relative shadow-sm">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 bg-[#071A2F] text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-3">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Instant Auto-Amount QR</span>
              </div>

              <h3 className="text-base sm:text-lg font-black text-[#071A2F]">
                Scan to Pay ₹{formattedDisplayAmount}
              </h3>
              <p className="text-xs text-[#687386] mt-0.5">
                Scan with PhonePe, Google Pay, Paytm, or any UPI App
              </p>

              {/* Supported apps ribbon */}
              <div className="flex items-center justify-center gap-2 my-4 flex-wrap">
                <span className="text-[10px] font-bold text-[#5f259f] bg-[#5f259f]/10 px-2 py-0.5 rounded-md">
                  PhonePe
                </span>
                <span className="text-[10px] font-bold text-[#1a73e8] bg-[#1a73e8]/10 px-2 py-0.5 rounded-md">
                  Google Pay
                </span>
                <span className="text-[10px] font-bold text-[#00b9f5] bg-[#00b9f5]/10 px-2 py-0.5 rounded-md">
                  Paytm
                </span>
                <span className="text-[10px] font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md">
                  BHIM / Cred
                </span>
              </div>

              {/* QR Code Canvas Frame */}
              <div className="my-5 flex justify-center">
                <div className="relative p-4 bg-white rounded-2xl border-2 border-gray-200/90 shadow-md inline-block">
                  {qrLoading ? (
                    <div className="w-56 h-56 sm:w-64 sm:h-64 flex flex-col items-center justify-center bg-gray-50 rounded-xl">
                      <div className="w-8 h-8 border-3 border-[#071A2F] border-t-transparent rounded-full animate-spin mb-2" />
                      <p className="text-xs text-[#687386]">Generating QR...</p>
                    </div>
                  ) : qrDataUrl ? (
                    <div className="relative">
                      <img 
                        src={qrDataUrl} 
                        alt={`UPI QR Code for ₹${formattedDisplayAmount}`}
                        className="w-56 h-56 sm:w-64 sm:h-64 object-contain rounded-xl select-none"
                      />
                      {/* Center UPI logo pill */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="bg-white/95 px-2.5 py-0.5 rounded-md shadow-xs border border-gray-300 font-black text-[11px] tracking-wider text-[#071A2F]">
                          UPI
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

              {/* Payee Info Pills */}
              <div className="bg-white rounded-2xl p-3 border border-gray-200 space-y-1 text-xs text-left max-w-xs mx-auto mb-4">
                <div className="flex justify-between text-[#687386]">
                  <span>Payee:</span>
                  <span className="font-bold text-[#071A2F]">{MERCHANT_NAME}</span>
                </div>
                <div className="flex justify-between text-[#687386]">
                  <span>Amount:</span>
                  <span className="font-black text-emerald-700">₹{formattedDisplayAmount}</span>
                </div>
                <div className="flex justify-between text-[#687386]">
                  <span>UPI ID:</span>
                  <span className="font-mono font-bold text-[#071A2F]">{MERCHANT_UPI_ID}</span>
                </div>
              </div>

              {/* Save / Download QR to Gallery */}
              <button
                type="button"
                onClick={handleDownloadQr}
                className="w-full max-w-xs mx-auto bg-[#071A2F] hover:bg-[#123C69] text-white py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all active:scale-[0.99]"
              >
                <Download className="w-4 h-4" />
                <span>Save QR Code to Gallery</span>
              </button>
              <p className="text-[11px] text-[#687386] mt-2">
                On mobile: Save QR $\rightarrow$ Open PhonePe/GPay scanner $\rightarrow$ Choose from Gallery
              </p>

            </div>
          </div>

          {/* ----------------- COLUMN 2: DIRECT UPI ID & MANUAL TRANSFER ----------------- */}
          <div className={`${mobileTab === 'qr' ? 'hidden md:block' : 'block'} space-y-5`}>
            
            <div className="text-left space-y-1">
              <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-1">
                <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Reliable Direct VPA</span>
              </div>
              <h3 className="text-lg font-black text-[#071A2F]">
                Pay Directly via UPI ID
              </h3>
              <p className="text-xs text-[#687386]">
                Copy our verified UPI ID and paste it in your UPI app under <strong>"To UPI ID"</strong> or <strong>"To Mobile"</strong>.
              </p>
            </div>

            {/* Primary UPI ID Card (Grand Showcase) */}
            <div className="bg-gradient-to-r from-emerald-50/70 to-teal-50/70 border-2 border-emerald-400/80 rounded-2xl p-4 sm:p-5 relative shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-black text-emerald-950 uppercase tracking-wider">
                  Store Primary UPI ID (Recommended)
                </span>
                <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                  Instant
                </span>
              </div>

              <div className="bg-white border border-emerald-300 rounded-xl p-3 flex items-center justify-between gap-3 shadow-2xs">
                <div className="overflow-hidden">
                  <span className="block font-mono text-base sm:text-lg font-black text-[#071A2F] select-all tracking-wider truncate">
                    {MERCHANT_UPI_ID}
                  </span>
                  <span className="text-[10px] text-[#687386] font-medium">
                    Name: <strong>{MERCHANT_NAME}</strong>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopyText(MERCHANT_UPI_ID, 'primary_vpa')}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                    copiedId === 'primary_vpa'
                      ? 'bg-emerald-600 text-white scale-105'
                      : 'bg-[#071A2F] hover:bg-[#123C69] text-white'
                  }`}
                >
                  {copiedId === 'primary_vpa' ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>COPIED!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>COPY UPI ID</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[11px] text-emerald-900/80 mt-2 font-medium">
                Open PhonePe / GPay $\rightarrow$ Tap <strong>"To UPI ID"</strong> $\rightarrow$ Paste <code className="font-mono bg-white px-1 py-0.5 rounded border border-emerald-200">{MERCHANT_UPI_ID}</code>
              </p>
            </div>

            {/* Pay to Mobile Number Card */}
            <div className="bg-[#FAF8F4] border border-[#071A2F]/10 rounded-2xl p-4 sm:p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-black text-[#071A2F] uppercase tracking-wider">
                  Pay to Mobile Number
                </span>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                  PhonePe / GPay
                </span>
              </div>

              <div className="bg-white border border-gray-300 rounded-xl p-3 flex items-center justify-between gap-3 shadow-2xs">
                <div>
                  <span className="block font-mono text-base font-black text-[#071A2F] select-all">
                    +91 {MERCHANT_PHONE}
                  </span>
                  <span className="text-[10px] text-[#687386]">
                    Business Contact: <strong>8985993948</strong>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopyText(MERCHANT_PHONE, 'phone')}
                  className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                    copiedId === 'phone'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white border border-gray-300 text-[#071A2F] hover:bg-gray-100'
                  }`}
                >
                  {copiedId === 'phone' ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>COPIED</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>COPY NUMBER</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[11px] text-[#687386] mt-2">
                Open PhonePe $\rightarrow$ Select <strong>"To Mobile Number"</strong> $\rightarrow$ Enter <strong>8985993948</strong>
              </p>
            </div>

            {/* Alternate UPI ID */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-[#687386] uppercase tracking-wider">
                  Alternate UPI ID (PhonePe Yes Bank)
                </span>
              </div>
              <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-2.5">
                <span className="font-mono text-xs sm:text-sm font-bold text-[#071A2F] select-all">
                  {ALT_MERCHANT_UPI_ID}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyText(ALT_MERCHANT_UPI_ID, 'alt_vpa')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    copiedId === 'alt_vpa'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-[#071A2F] hover:bg-gray-200'
                  }`}
                >
                  {copiedId === 'alt_vpa' ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </div>

            {/* 3 Step Visual Guide */}
            <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 text-left space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-blue-950">
                Simple 3-Step Payment Process:
              </h4>
              <ol className="text-xs text-blue-900/90 space-y-1.5 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-blue-200 text-blue-900 font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                  <span>Scan the QR code OR copy the UPI ID <strong className="font-mono text-blue-950">Q489570312@ybl</strong>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-blue-200 text-blue-900 font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                  <span>Open your UPI app (PhonePe, GPay, Paytm) and complete payment of <strong className="text-blue-950">₹{formattedDisplayAmount}</strong>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-blue-200 text-blue-900 font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                  <span>Enter the 12-digit UTR/Ref number below and tap <strong>"Confirm Order"</strong>.</span>
                </li>
              </ol>
            </div>

          </div>

        </div>

        {/* ================= TRANSACTION UTR & CONFIRMATION ================= */}
        <div className="max-w-xl mx-auto mt-10 pt-8 border-t border-gray-200 space-y-4">
          
          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#071A2F]">
              Enter 12-Digit UPI Reference / UTR No. <span className="text-gray-400 font-normal lowercase">(from your UPI receipt)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. 427812345678 (12 digits shown in PhonePe/GPay receipt)"
              value={utrNumber}
              onChange={(e) => setUtrNumber(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
              maxLength={22}
              className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-sm sm:text-base font-mono text-[#071A2F] tracking-wider transition-all placeholder:text-gray-400"
            />
          </div>

          {/* Confirm Button */}
          <button
            type="button"
            onClick={onConfirmPayment}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 px-6 rounded-2xl font-black text-base sm:text-lg shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2.5 min-h-[56px] active:scale-[0.99] cursor-pointer transition-all"
          >
            <CheckCircle2 className="w-5 h-5 text-white" />
            <span>I Have Paid ₹{formattedDisplayAmount} — Confirm Order</span>
          </button>

          {/* WhatsApp Support Link */}
          <div className="flex items-center justify-center pt-2">
            <a 
              href={`https://wa.me/918985993948?text=${encodeURIComponent(`Hi Infinity Customizations, I am making a UPI payment of ₹${formattedDisplayAmount} for Order #${orderId}. Please help verify.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-50/80 hover:bg-emerald-100 border border-emerald-200 px-4 py-2 rounded-xl transition-all"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>WhatsApp Payment Support (+91 89859 93948)</span>
            </a>
          </div>

          <div className="p-3.5 bg-[#FAF8F4] border border-[#071A2F]/10 rounded-2xl text-[11px] text-[#687386] text-center leading-relaxed">
            <Lock className="w-3.5 h-3.5 text-emerald-700 inline-block mr-1" />
            Your order is protected by Infinity Customizations purchase guarantee. Once confirmed, our team reviews the payment and immediately reaches out on WhatsApp for your custom photo previews.
          </div>

        </div>

      </div>

    </div>
  );
};

export default UpiPaymentView;
