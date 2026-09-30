import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Phone, Lock, User, AlertCircle, CheckCircle, Loader, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyCredentials } = useAuth();
  const redirectTo = location.state?.from?.pathname || location.state?.from || '/';

  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Login with Phone, Password & Name — Logic strictly preserved
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!/^[6-9]\d{9}$/.test(phoneNumber)) {
      setError('Please enter a valid 10-digit Indian phone number');
      return;
    }

    if (!password || password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }

    if (!name || name.trim().length < 2) {
      setError('Please enter a valid name');
      return;
    }

    try {
      setLoading(true);
      const response = await verifyCredentials(phoneNumber, password, name);

      if (response.success) {
        setSuccess('Login successful! Redirecting...');
        setTimeout(() => {
          navigate(redirectTo, { replace: true });
        }, 1200);
      } else {
        setError(response.error || 'Failed to login');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center py-8 sm:py-16 px-4 sm:px-6">
      {/* Centered Premium Split Card */}
      <div className="w-full max-w-4xl bg-white rounded-2xl sm:rounded-3xl border border-[#071A2F]/8 shadow-[0_10px_40px_rgba(7,26,47,0.06)] overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        
        {/* DESKTOP LEFT: Brand & Editorial Visual Showcase (lg+) */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-10 bg-[#071A2F] text-white relative overflow-hidden">
          {/* Subtle Champagne Radial Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#C5A46D]/15 rounded-full blur-3xl pointer-events-none" />

          <div>
            <Link to="/" className="inline-block mb-8">
              <span className="text-2xl font-extrabold tracking-tight text-white block">
                Infinity
              </span>
              <span className="text-[10px] font-bold tracking-[0.28em] text-[#C5A46D] uppercase block mt-0.5">
                CUSTOMIZATIONS
              </span>
            </Link>

            {/* Editorial Visual */}
            <div className="w-full aspect-[4/4.5] rounded-2xl overflow-hidden border border-white/10 shadow-lg mb-6 relative">
              <img 
                src="/images/4 x 6 black frame 199.jpg" 
                alt="Personalized Gifts" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#071A2F]/80 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#C5A46D] block">Artisanal Gifting</span>
                <p className="text-xs font-semibold">Handcrafted with precision</p>
              </div>
            </div>

            <p className="font-serif italic text-base text-[#DECBA6] leading-snug">
              "A memory made tangible."
            </p>
            <p className="text-xs text-gray-300 font-light mt-1">
              Sign in to view past orders, track deliveries, and manage your account.
            </p>
          </div>

          {/* Trust badges */}
          <div className="pt-6 border-t border-white/10 flex items-center gap-2 text-[11px] text-gray-400">
            <ShieldCheck size={14} className="text-[#C5A46D] flex-shrink-0" />
            <span>Encrypted • Verified Studio Production</span>
          </div>
        </div>

        {/* RIGHT (Mobile & Desktop): Clean Form Container */}
        <div className="col-span-1 lg:col-span-7 p-6 sm:p-10 md:p-12 flex flex-col justify-center bg-white">
          
          {/* Mobile Header Branding */}
          <div className="lg:hidden text-center mb-6">
            <Link to="/" className="inline-block">
              <span className="text-2xl font-extrabold tracking-tight text-[#071A2F] block">
                Infinity
              </span>
              <span className="text-[10px] font-bold tracking-[0.25em] text-[#C5A46D] uppercase block mt-0.5">
                CUSTOMIZATIONS
              </span>
            </Link>
          </div>

          <div className="mb-6">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#071A2F] tracking-tight">
              WELCOME BACK
            </h1>
            <p className="text-xs sm:text-sm text-[#687386] font-normal mt-1">
              Sign in to continue to your account.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Full Name */}
            <div>
              <label className="block text-[11px] sm:text-xs font-bold text-[#071A2F] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <User size={13} className="text-[#687386]" />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                disabled={loading}
                autoComplete="name"
                className="w-full h-[52px] px-4 rounded-xl border border-[#071A2F]/15 bg-[#FAF8F4] focus:bg-white text-sm font-medium text-[#071A2F] placeholder:text-[#687386]/50 focus:outline-none focus:border-[#071A2F] focus:ring-2 focus:ring-[#071A2F]/15 transition-all disabled:opacity-50"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-[11px] sm:text-xs font-bold text-[#071A2F] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Phone size={13} className="text-[#687386]" />
                <span>Phone Number</span>
              </label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#687386] pointer-events-none">
                  +91
                </span>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  disabled={loading}
                  autoComplete="tel"
                  className="w-full h-[52px] pl-12 pr-4 rounded-xl border border-[#071A2F]/15 bg-[#FAF8F4] focus:bg-white text-sm font-medium text-[#071A2F] placeholder:text-[#687386]/50 focus:outline-none focus:border-[#071A2F] focus:ring-2 focus:ring-[#071A2F]/15 transition-all disabled:opacity-50 font-mono"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] sm:text-xs font-bold text-[#071A2F] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Lock size={13} className="text-[#687386]" />
                <span>Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={loading}
                  autoComplete="current-password"
                  className="w-full h-[52px] pl-4 pr-12 rounded-xl border border-[#071A2F]/15 bg-[#FAF8F4] focus:bg-white text-sm font-medium text-[#071A2F] placeholder:text-[#687386]/50 focus:outline-none focus:border-[#071A2F] focus:ring-2 focus:ring-[#071A2F]/15 transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-0 top-0 bottom-0 w-12 flex items-center justify-center text-[#687386] hover:text-[#071A2F] transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700 font-medium">
                <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-800 font-medium">
                <CheckCircle size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || phoneNumber.length !== 10 || !password || !name}
                className="w-full h-[52px] bg-[#071A2F] hover:bg-[#0B2748] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader size={16} className="animate-spin text-white" />
                    <span>AUTHENTICATING...</span>
                  </>
                ) : (
                  <span>SIGN IN</span>
                )}
              </button>
            </div>
          </form>

          {/* Clean Helper Note & Legal Links */}
          <div className="mt-6 pt-5 border-t border-[#071A2F]/8 text-center space-y-2">
            <p className="text-xs text-[#687386] font-normal">
              New to Infinity? You can shop and checkout directly anytime.
            </p>
            <p className="text-[11px] text-[#687386]">
              By signing in, you agree to our{' '}
              <Link to="/terms-and-conditions" className="text-[#071A2F] font-bold hover:underline">
                Terms
              </Link>{' '}
              and{' '}
              <Link to="/privacy-policy" className="text-[#071A2F] font-bold hover:underline">
                Privacy Policy
              </Link>.
            </p>
          </div>

          {/* Security Indicator */}
          <div className="flex items-center justify-center gap-1.5 mt-4 text-[11px] text-[#687386]">
            <ShieldCheck size={13} className="text-emerald-600" />
            <span>Secured with 256-bit encryption</span>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Login;
