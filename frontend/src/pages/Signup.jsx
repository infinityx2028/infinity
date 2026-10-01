import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { User, Mail, Phone, Lock, AlertCircle, CheckCircle, Loader, Eye, EyeOff, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AuthMemoryCollage from '../components/AuthMemoryCollage';

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signupUser } = useAuth();
  const redirectTo = location.state?.from?.pathname || location.state?.from || '/';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setError('Please enter your full name (at least 2 characters)');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    const cleanPhone = formData.phoneNumber.replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setError('Please enter a valid 10-digit Indian mobile number');
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const res = await signupUser({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phoneNumber: cleanPhone,
        password: formData.password
      });

      if (res.success) {
        const firstName = formData.name.trim().split(' ')[0];
        setSuccess(`Welcome to Infinity, ${firstName}! ✦`);
        setTimeout(() => {
          navigate(redirectTo, { replace: true });
        }, 320);
      } else {
        setError(res.error || 'Failed to create account. Please try again.');
      }
    } catch (err) {
      setError('An error occurred during account creation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="motion-auth-shell min-h-screen bg-[#FAF8F4] flex items-center justify-center py-6 sm:py-14 px-3 sm:px-6">
      <div className="w-full max-w-4xl bg-white rounded-[24px] sm:rounded-3xl border border-[#071A2F]/8 shadow-[0_12px_44px_rgba(7,26,47,0.06)] overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        
        <aside className="motion-auth-art hidden lg:flex lg:col-span-5"><p className="motion-kicker">INFINITY / THE PERSONALIZED GIFT STUDIO</p><h2>Your moments.<br /><em>A new beginning.</em></h2><AuthMemoryCollage /><p>Your photos. Your words. Your stories.<br />Something beautifully yours.</p></aside>

        {/* RIGHT: Signup Form */}
        <div className="col-span-1 lg:col-span-7 p-5 sm:p-10 md:p-12 flex flex-col justify-center bg-white">
          
          {/* Mobile Brand */}
          <div className="lg:hidden text-center mb-4">
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
              <span>Join Infinity ✦</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#071A2F] tracking-tight">
              Create Your Account
            </h1>
            <p className="text-xs sm:text-sm text-[#687386] font-normal mt-1 max-w-md">
              Create your account to track orders, save favourites and make gifting easier.
            </p>
          </div>

          {/* Error / Success Alerts */}
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

          {/* Form */}
          <form onSubmit={handleSignup} className="space-y-3.5">
            
            {/* Full Name */}
            <div>
              <label htmlFor="signup-name" className="block text-[11px] sm:text-xs font-bold text-[#071A2F] uppercase tracking-wider mb-1">
                Full Name
              </label>
              <div className="relative group">
                <input
                  type="text"
                  id="signup-name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Ananya Sharma"
                  disabled={loading}
                  autoComplete="name"
                  className="w-full h-[48px] pl-4 pr-10 rounded-xl border border-[#071A2F]/15 bg-[#FAF8F4] focus:bg-white text-sm font-medium text-[#071A2F] placeholder:text-[#687386]/50 focus:outline-none focus:border-[#071A2F] focus:ring-2 focus:ring-[#071A2F]/15 transition-all disabled:opacity-50"
                  required
                />
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#687386] pointer-events-none">
                  <User size={16} />
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="signup-email" className="block text-[11px] sm:text-xs font-bold text-[#071A2F] uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative group">
                <input
                  type="email"
                  id="signup-email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. ananya@gmail.com"
                  disabled={loading}
                  autoComplete="email"
                  className="w-full h-[48px] pl-4 pr-10 rounded-xl border border-[#071A2F]/15 bg-[#FAF8F4] focus:bg-white text-sm font-medium text-[#071A2F] placeholder:text-[#687386]/50 focus:outline-none focus:border-[#071A2F] focus:ring-2 focus:ring-[#071A2F]/15 transition-all disabled:opacity-50"
                  required
                />
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#687386] pointer-events-none">
                  <Mail size={16} />
                </div>
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label htmlFor="signup-phoneNumber" className="block text-[11px] sm:text-xs font-bold text-[#071A2F] uppercase tracking-wider mb-1">
                Mobile Number (for Order & WhatsApp updates)
              </label>
              <div className="relative group">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#071A2F]/70 pointer-events-none">
                  +91
                </div>
                <input
                  type="tel"
                  id="signup-phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="98765 43210"
                  maxLength={10}
                  disabled={loading}
                  autoComplete="tel"
                  className="w-full h-[48px] pl-12 pr-10 rounded-xl border border-[#071A2F]/15 bg-[#FAF8F4] focus:bg-white text-sm font-medium text-[#071A2F] placeholder:text-[#687386]/50 focus:outline-none focus:border-[#071A2F] focus:ring-2 focus:ring-[#071A2F]/15 transition-all disabled:opacity-50"
                  required
                />
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#687386] pointer-events-none">
                  <Phone size={16} />
                </div>
              </div>
            </div>

            {/* Password & Confirm Password Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="signup-password" className="block text-[11px] sm:text-xs font-bold text-[#071A2F] uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="relative group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="signup-password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min 6 characters"
                    disabled={loading}
                    autoComplete="new-password"
                    className="w-full h-[48px] pl-3.5 pr-10 rounded-xl border border-[#071A2F]/15 bg-[#FAF8F4] focus:bg-white text-sm font-medium text-[#071A2F] placeholder:text-[#687386]/50 focus:outline-none focus:border-[#071A2F] focus:ring-2 focus:ring-[#071A2F]/15 transition-all disabled:opacity-50"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#687386] hover:text-[#071A2F] p-1"
                    aria-label="Toggle password view"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="signup-confirmPassword" className="block text-[11px] sm:text-xs font-bold text-[#071A2F] uppercase tracking-wider mb-1">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="signup-confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  disabled={loading}
                  autoComplete="new-password"
                  className="w-full h-[48px] px-3.5 rounded-xl border border-[#071A2F]/15 bg-[#FAF8F4] focus:bg-white text-sm font-medium text-[#071A2F] placeholder:text-[#687386]/50 focus:outline-none focus:border-[#071A2F] focus:ring-2 focus:ring-[#071A2F]/15 transition-all disabled:opacity-50"
                  required
                />
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
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>CREATE ACCOUNT</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Already have an account */}
          <div className="mt-5 pt-4 border-t border-gray-100 text-center">
            <p className="text-xs sm:text-sm text-[#687386] font-normal mb-2">
              Already have an account?
            </p>
            <Link
              to="/login"
              state={location.state}
              className="text-xs font-bold text-[#071A2F] hover:underline uppercase tracking-wider"
            >
              SIGN IN TO YOUR ACCOUNT →
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Signup;
