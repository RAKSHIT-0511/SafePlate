import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import {
  ShieldCheck,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sparkles,
} from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { login, signUp } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmationNoticeEmail, setConfirmationNoticeEmail] = useState<string | null>(null);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setErrorMessage(null);
  };

  const handleSwitchMode = (targetMode: 'login' | 'signup') => {
    setMode(targetMode);
    setErrorMessage(null);
    setConfirmationNoticeEmail(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    try {
      setIsSubmitting(true);
      const { error } = await login(trimmedEmail, password);

      if (error) {
        setErrorMessage(error.message);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during sign in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage('Please enter an email address.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await signUp(trimmedEmail, password);

      if (result.error) {
        setErrorMessage(result.error.message);
        return;
      }

      if (result.requiresEmailConfirmation) {
        setConfirmationNoticeEmail(trimmedEmail);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-surface text-on-surface px-4 py-8 animate-fade-in">
      {/* Top Bar Brand */}
      <header className="max-w-md mx-auto w-full flex items-center justify-between pb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="font-extrabold text-xl text-primary tracking-tight">SafePlate</span>
            <span className="block text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold">
              Allergy Safety Engine
            </span>
          </div>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="max-w-md mx-auto w-full">
        <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-3xl shadow-tactile border border-outline-variant/40 flex flex-col gap-6">
          {/* Email Confirmation Required Screen */}
          {confirmationNoticeEmail ? (
            <div className="flex flex-col items-center text-center gap-4 py-4 animate-scale-up">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="flex flex-col gap-1.5">
                <h2 className="text-xl font-black text-on-surface tracking-tight">
                  Check Your Email
                </h2>
                <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                  We've sent a verification link to{' '}
                  <strong className="text-on-surface">{confirmationNoticeEmail}</strong>.
                </p>
                <p className="text-xs text-on-surface-variant/80 mt-1">
                  Please click the link in your email to confirm your account, then sign in below.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setConfirmationNoticeEmail(null);
                  setMode('login');
                  resetForm();
                }}
                className="w-full h-12 rounded-xl bg-primary hover:bg-tertiary text-on-primary font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>Proceed to Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              {/* Card Title & Mode Toggle Tabs */}
              <div className="flex flex-col gap-2 text-center">
                <h1 className="text-2xl font-black text-on-surface tracking-tight">
                  {mode === 'login' ? 'Welcome Back' : 'Create an Account'}
                </h1>
                <p className="text-xs sm:text-sm text-on-surface-variant">
                  {mode === 'login'
                    ? 'Sign in to access your household allergy safety planner.'
                    : 'Get started with deterministic allergy safety for your kitchen.'}
                </p>

                {/* Tab Pill Switcher */}
                <div className="grid grid-cols-2 p-1 rounded-xl bg-surface-container-low mt-3 border border-outline-variant/30">
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('login')}
                    className={`h-9 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      mode === 'login'
                        ? 'bg-surface-container-lowest text-primary shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('signup')}
                    className={`h-9 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      mode === 'signup'
                        ? 'bg-surface-container-lowest text-primary shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    Sign Up
                  </button>
                </div>
              </div>

              {/* Error Message Alert Banner */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-error-container text-error text-xs font-semibold flex items-start gap-2.5 animate-scale-up">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* 1. LOGIN FORM */}
              {mode === 'login' && (
                <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
                  {/* Email Input */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="login_email"
                      className="text-xs font-bold text-on-surface uppercase tracking-wider"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        id="login_email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full h-12 pl-10 pr-4 rounded-xl bg-surface-container-low text-on-surface placeholder:text-on-surface-variant/50 text-sm font-medium border border-outline-variant/40 focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary shadow-inner"
                      />
                      <Mail className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-4 pointer-events-none" />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="login_password"
                      className="text-xs font-bold text-on-surface uppercase tracking-wider"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="login_password"
                        type="password"
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full h-12 pl-10 pr-4 rounded-xl bg-surface-container-low text-on-surface placeholder:text-on-surface-variant/50 text-sm font-medium border border-outline-variant/40 focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary shadow-inner"
                      />
                      <Lock className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-4 pointer-events-none" />
                    </div>
                  </div>

                  {/* Primary Login Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 mt-2 rounded-xl bg-primary hover:bg-tertiary text-on-primary font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Signing In...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {/* Switch to Sign Up */}
                  <div className="text-center pt-2">
                    <p className="text-xs text-on-surface-variant">
                      Don't have an account?{' '}
                      <button
                        type="button"
                        onClick={() => handleSwitchMode('signup')}
                        className="text-primary font-bold hover:underline cursor-pointer"
                      >
                        Sign Up
                      </button>
                    </p>
                  </div>
                </form>
              )}

              {/* 2. SIGN UP FORM */}
              {mode === 'signup' && (
                <form onSubmit={handleSignUpSubmit} className="flex flex-col gap-4">
                  {/* Email Input */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="signup_email"
                      className="text-xs font-bold text-on-surface uppercase tracking-wider"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        id="signup_email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full h-12 pl-10 pr-4 rounded-xl bg-surface-container-low text-on-surface placeholder:text-on-surface-variant/50 text-sm font-medium border border-outline-variant/40 focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary shadow-inner"
                      />
                      <Mail className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-4 pointer-events-none" />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="signup_password"
                      className="text-xs font-bold text-on-surface uppercase tracking-wider"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="signup_password"
                        type="password"
                        autoComplete="new-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimum 6 characters"
                        className="w-full h-12 pl-10 pr-4 rounded-xl bg-surface-container-low text-on-surface placeholder:text-on-surface-variant/50 text-sm font-medium border border-outline-variant/40 focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary shadow-inner"
                      />
                      <Lock className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-4 pointer-events-none" />
                    </div>
                  </div>

                  {/* Confirm Password Input */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="signup_confirm_password"
                      className="text-xs font-bold text-on-surface uppercase tracking-wider"
                    >
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        id="signup_confirm_password"
                        type="password"
                        autoComplete="new-password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter your password"
                        className="w-full h-12 pl-10 pr-4 rounded-xl bg-surface-container-low text-on-surface placeholder:text-on-surface-variant/50 text-sm font-medium border border-outline-variant/40 focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary shadow-inner"
                      />
                      <Lock className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-4 pointer-events-none" />
                    </div>
                  </div>

                  {/* Primary Sign Up Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 mt-2 rounded-xl bg-primary hover:bg-tertiary text-on-primary font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Creating Account...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Create Account</span>
                      </>
                    )}
                  </button>

                  {/* Switch to Sign In */}
                  <div className="text-center pt-2">
                    <p className="text-xs text-on-surface-variant">
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => handleSwitchMode('login')}
                        className="text-primary font-bold hover:underline cursor-pointer"
                      >
                        Sign In
                      </button>
                    </p>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </main>

      {/* Footer Disclaimer */}
      <footer className="max-w-md mx-auto w-full text-center pt-6">
        <p className="text-[11px] text-on-surface-variant leading-relaxed">
          SafePlate is a planning and ingredient-checking tool and does not replace medical advice or
          careful label reading.
        </p>
      </footer>
    </div>
  );
};
