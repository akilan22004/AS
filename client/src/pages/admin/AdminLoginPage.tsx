import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Mail, Lock, Eye, EyeOff, LogIn, ShieldAlert, ShieldCheck } from 'lucide-react';
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
      setError(err instanceof Error ? err.message : 'Unable to sign in. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F7F3EC] flex flex-col justify-between font-sans relative">
      {/* Top Navbar */}
      <div className="w-full bg-[#241B16] text-[#F7F3EC] px-4 sm:px-8 py-3 flex items-center justify-between border-b border-[#3D2C22]">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-[#C8A77D] hover:text-white transition-colors"
        >
          <ChevronLeft size={16} />
          <span>Return to Website</span>
        </Link>
        <div className="bg-white px-3 py-1 rounded-lg border border-[#DDD1C0] shadow-sm flex items-center justify-center">
          <img
            src="/assets/annamalai-logo.png"
            alt="Annamalai Furniture Logo"
            className="h-6 w-auto object-contain"
          />
        </div>
      </div>

      {/* Main Centered Login Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md bg-[#FCFAF7] border border-[#DDD1C0] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Brand Logo & Shield Badge */}
          <div className="text-center">
            <div className="inline-block bg-white px-4 py-2 rounded-2xl border border-[#DDD1C0] shadow-sm mb-4">
              <img
                src="/assets/annamalai-logo.png"
                alt="Annamalai Furniture Official Logo"
                className="h-10 sm:h-12 w-auto object-contain mx-auto"
              />
            </div>

            <h1 className="font-serif text-2xl font-bold text-[#241B16] leading-tight">
              Admin Portal
            </h1>
            <p className="text-xs text-[#695446] mt-1.5 max-w-xs mx-auto leading-relaxed">
              Authorized management console for Annamalai Furniture catalog and media.
            </p>

            {/* Leaf divider */}
            <div className="flex items-center justify-center gap-2 mt-3">
              <span className="w-10 h-[1px] bg-[#C8A77D]"></span>
              <span className="text-xs text-[#B69764]">🍃</span>
              <span className="w-10 h-[1px] bg-[#C8A77D]"></span>
            </div>
          </div>

          {/* Error notice */}
          {error && (
            <div role="alert" className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-center gap-2.5 shadow-sm">
              <ShieldAlert size={16} className="flex-shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-[#241B16] mb-1">
                Admin Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8A7569]">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@annamalai.com"
                  autoComplete="email"
                  className="w-full bg-[#FAF7F2] border border-[#DDD1C0] rounded-xl py-2.5 pl-10 pr-4 text-xs text-[#241B16] placeholder-[#9E8B7F] focus:outline-none focus:border-[#493326] focus:ring-1 focus:ring-[#493326] transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-bold text-[#241B16] mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8A7569]">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  autoComplete="current-password"
                  className="w-full bg-[#FAF7F2] border border-[#DDD1C0] rounded-xl py-2.5 pl-10 pr-10 text-xs text-[#241B16] placeholder-[#9E8B7F] focus:outline-none focus:border-[#493326] focus:ring-1 focus:ring-[#493326] transition-all"
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
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 bg-[#493326] hover:bg-[#34241A] text-[#F7F3EC] py-3 rounded-xl font-serif text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] disabled:opacity-75 cursor-pointer"
            >
              <LogIn size={16} />
              <span>{isSubmitting ? 'Verifying Credentials...' : 'Sign In to Admin Studio'}</span>
            </button>
          </form>

          {/* Security footnote */}
          <div className="pt-2 border-t border-[#EAE2D5] text-center">
            <p className="text-[10px] text-[#8A7569] flex items-center justify-center gap-1">
              <ShieldCheck size={12} className="text-[#B69764]" />
              <span>Protected by Supabase Row Level Security & JWT Authentication</span>
            </p>
          </div>
        </div>
      </main>

      {/* Footer copyright */}
      <footer className="py-3 text-center text-[10px] text-[#8A7569] border-t border-[#EAE2D5]">
        © {new Date().getFullYear()} Annamalai Furniture. All rights reserved.
      </footer>
    </div>
  );
};
