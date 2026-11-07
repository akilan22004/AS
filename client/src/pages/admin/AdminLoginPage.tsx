import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Mail, Lock, Eye, EyeOff, LogIn, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate('/admin/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to sign in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-w-[320px] max-w-[480px] mx-auto min-h-screen bg-[#F7F3EC] shadow-2xl flex flex-col font-sans relative overflow-hidden select-none">
      {/* Top Hero Section (Matching Image 5) */}
      <div className="relative w-full aspect-[576/395] overflow-hidden bg-[#241B16]">
        <img
          src="/assets/admin-top-hero.jpg"
          alt="Luxury Furniture Collection"
          className="w-full h-full object-cover"
        />

        {/* Top Navigation Bar without fake status bar */}
        <div className="absolute top-0 left-0 right-0 p-3 flex items-center justify-between text-white/90 z-20">
          <Link
            to="/"
            className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center transition-colors"
            aria-label="Back to website"
          >
            <ChevronLeft size={20} />
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-[#C8A77D] font-serif font-medium pr-2">
            <span>ANNAMALAI</span>
          </div>
        </div>
      </div>

      {/* Main Login Form Card with sculpted wave top */}
      <div className="relative -mt-6 bg-[#F7F3EC] rounded-t-[32px] pt-5 px-6 pb-4 flex-1 shadow-2xl z-20 flex flex-col justify-between">
        <div>
          {/* Shield Lock Badge */}
          <div className="flex justify-center mb-2">
            <div className="w-12 h-12 rounded-2xl bg-[#EFE9DF] border border-[#D9CEBF] flex items-center justify-center text-[#493326] shadow-sm">
              <svg className="w-6 h-6 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="1.8">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <rect x="9" y="11" width="6" height="5" rx="1" strokeWidth="1.5" />
                <path d="M10 11V9a2 2 0 0 1 4 0v2" strokeWidth="1.5" />
              </svg>
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-4">
            <h2 className="font-serif text-[24px] font-bold text-[#241B16] leading-tight">
              Admin Portal
            </h2>
            <p className="text-[11px] text-[#695446] mt-1 max-w-[260px] mx-auto leading-relaxed">
              Manage your furniture collection, products and website content.
            </p>
            {/* Leaf divider */}
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="w-8 h-[1px] bg-[#C8A77D]"></span>
              <span className="text-xs text-[#B69764]">🍃</span>
              <span className="w-8 h-[1px] bg-[#C8A77D]"></span>
            </div>
          </div>

          {/* Error notice */}
          {error && (
            <div role="alert" className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-800 text-[11px] flex items-center gap-2">
              <ShieldAlert size={16} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Email Field */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8A7569]">
                <Mail size={16} />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                autoComplete="email"
                className="w-full bg-[#FCFAF7] border border-[#DDD1C0] rounded-2xl py-3 pl-10 pr-4 text-xs text-[#241B16] placeholder-[#9E8B7F] focus:outline-none focus:border-[#493326] focus:ring-1 focus:ring-[#493326] transition-all"
              />
            </div>

            {/* Password Field */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8A7569]">
                <Lock size={16} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                autoComplete="current-password"
                className="w-full bg-[#FCFAF7] border border-[#DDD1C0] rounded-2xl py-3 pl-10 pr-10 text-xs text-[#241B16] placeholder-[#9E8B7F] focus:outline-none focus:border-[#493326] focus:ring-1 focus:ring-[#493326] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#8A7569] hover:text-[#241B16] transition-colors"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-3 bg-[#493326] hover:bg-[#38251C] text-[#F7F3EC] py-3 rounded-full font-serif text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] disabled:opacity-75"
            >
              <LogIn size={16} />
              <span>{isSubmitting ? 'Verifying...' : 'Secure Login'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Bottom Woodcarving Workbench Background */}
      <div className="w-full aspect-[576/169] overflow-hidden bg-[#241B16] relative z-10">
        <img
          src="/assets/admin-bottom-bench.jpg"
          alt="Craftsman Woodcarving Workbench"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
};
