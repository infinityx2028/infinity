import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Mail, Lock, AlertCircle, CheckCircle, Loader, Eye, EyeOff, ShieldCheck, ArrowRight, Sparkles, X, MessageCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AuthMemoryCollage from '../components/AuthMemoryCollage';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginUser } = useAuth();
  const redirectTo = location.state?.from?.pathname || location.state?.from || '/';

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const cleanIdentifier = identifier.trim();
    if (!cleanIdentifier) {
      setError('Please enter your email or 10-digit mobile number');
      return;
    }

    if (!password) {
      setError('Please enter your password');
      return;
    }

    try {
      setLoading(true);
      const res = await loginUser(cleanIdentifier, password);

      if (res.success) {
        const firstName = res.user?.name ? res.user.name.split(' ')[0] : 'friend';
        setSuccess(`Welcome back, ${firstName}! ✦`);
        // Fast redirect (280ms)
        setTimeout(() => {
          navigate(redirectTo, { replace: true });
        }, 280);
      } else {
        setError(res.error || 'Failed to sign in. Please verify your credentials.');
      }
    } catch (err) {
      setError('A network error occurred. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="motion-auth-shell min-h-screen bg-[#FAF8F4] flex items-center justify-center py-6 sm:py-14 px-3 sm:px-6">
      {/* Container */}
      <div className="w-full max-w-4xl bg-white rounded-[24px] sm:rounded-3xl border border-[#071A2F]/8 shadow-[0_12px_44px_rgba(7,26,47,0.06)] overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        
        <aside className="motion-auth-art hidden lg:flex lg:col-span-5"><p className="motion-kicker">INFINITY / THE PERSONALIZED GIFT STUDIO</p><h2>Every gift.<br /><em>A little more personal.</em></h2><AuthMemoryCollage /><p>Your photos. Your words. Your stories.<br />Something beautifully yours.</p></aside>

        {/* RIGHT: Mobile & Desktop Form */}
        <div className="col-span-1 lg:col-span-7 p-5 sm:p-10 md:p-12 flex flex-col justify-center bg-white">
          
          {/* Top Brand Header (Mobile Only) */}
          <div className="lg:hidden text-center mb-3">
            <Link to="/" className="inline-block">
              <span className="text-2xl font-black tracking-tight text-[#071A2F] block">
                Infinity
              </span>
              <span className="text-[10px] font-bold tracking-[0.28em] text-[#C5A46D] uppercase block mt-0.5">
                CUSTOMIZATIONS
              </span>
            </Link>
          </div>

          <div className="lg:hidden"><AuthMemoryCollage compact /></div>

          {/* Heading */}
          <div className="mb-5 sm:mb-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FAF8F4] border border-[#071A2F]/8 text-[#071A2F] text-[11px] font-bold tracking-wider uppercase mb-2">
              <Sparkles size={11} className="text-[#C5A46D]" />
              <span>Welcome Back ✦</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#071A2F] tracking-tight">
              Sign In to Your Account
            </h1>
            <p className="text-xs sm:text-sm text-[#687386] font-normal mt-1 max-w-md">
              Your orders, saved gifts and memories are waiting.
            </p>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-2.5 animate-fadeIn">
              <CheckCircle size={16} className="text-emerald-600 flex-shrink-0" />
              <span className="font-bold">{success}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Email or Phone */}
            <div>
              <label htmlFor="login-identifier" className="block text-[11px] sm:text-xs font-bold text-[#071A2F] uppercase tracking-wider mb-1.5">
                Mobile Number or Email
              </label>
              <div className="relative group">
                <input
                  id="login-identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter 10-digit mobile number or email"
                  disabled={loading}
                  autoComplete="username"
                  className="w-full h-[50px] pl-4 pr-10 rounded-xl border border-[#071A2F]/15 bg-[#FAF8F4] focus:bg-white text-sm font-medium text-[#071A2F] placeholder:text-[#687386]/50 focus:outline-none focus:border-[#071A2F] focus:ring-2 focus:ring-[#071A2F]/15 transition-all disabled:opacity-50"
                  required
                />
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#687386] pointer-events-none">
                  <Mail size={16} />
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="block text-[11px] sm:text-xs font-bold text-[#071A2F] uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs font-bold text-[#071A2F]/70 hover:text-[#071A2F] underline transition-colors cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative group">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={loading}
                  autoComplete="current-password"
                  className="w-full h-[50px] pl-4 pr-11 rounded-xl border border-[#071A2F]/15 bg-[#FAF8F4] focus:bg-white text-sm font-medium text-[#071A2F] placeholder:text-[#687386]/50 focus:outline-none focus:border-[#071A2F] focus:ring-2 focus:ring-[#071A2F]/15 transition-all disabled:opacity-50"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#687386] hover:text-[#071A2F] p-1 transition-colors cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[50px] mt-2 rounded-xl bg-[#071A2F] hover:bg-[#03101D] text-white font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader size={16} className="animate-spin text-[#C5A46D]" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>SIGN IN</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* New to Infinity? Register */}
          <div className="mt-6 pt-5 border-t border-gray-100 text-center">
            <p className="text-xs sm:text-sm text-[#687386] font-normal mb-2.5">
              New to Infinity?
            </p>
            <Link
              to="/signup"
              state={location.state}
              className="w-full h-[46px] rounded-xl border-2 border-[#071A2F] text-[#071A2F] hover:bg-[#FAF8F4] font-bold text-xs uppercase tracking-wider flex items-center justify-center transition-all cursor-pointer"
            >
              CREATE AN ACCOUNT
            </Link>
          </div>

          <div className="mt-4 text-center">
            <Link to="/" className="text-xs text-[#687386] hover:text-[#071A2F] transition-colors">
              ← Return to Shopping
            </Link>
          </div>
        </div>

      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-[#03101D]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-[#071A2F]/10 shadow-2xl relative animate-fadeIn">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 text-[#687386] hover:text-[#071A2F] p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="w-10 h-10 rounded-full bg-[#FAF8F4] border border-[#071A2F]/10 flex items-center justify-center text-[#071A2F] mb-3">
              <Lock size={18} />
            </div>

            <h3 className="text-lg font-extrabold text-[#071A2F]">
              Need Help Signing In?
            </h3>
            <p className="text-xs sm:text-sm text-[#687386] mt-2 leading-relaxed">
              If you’ve forgotten your password or originally registered using OTP, our studio concierge can verify your registered mobile number and securely update your password on WhatsApp.
            </p>

            <div className="mt-5 flex flex-col gap-2.5">
              <a
                href={`https://wa.me/918985993948?text=${encodeURIComponent('Hi Infinity Customizations team, I need help resetting my account password.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-[46px] rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <MessageCircle size={16} />
                <span>Contact Studio on WhatsApp</span>
              </a>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="w-full h-[42px] rounded-xl border border-gray-200 text-gray-700 font-bold text-xs uppercase tracking-wider hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
