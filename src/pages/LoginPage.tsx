import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Copy,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Moon,
  Shield,
  Sparkles,
  Sun,
  Unlock,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { InputField } from '../components/ui/InputField';
import { useBank } from '../hooks/useBank';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';
import { useToast } from '../hooks/useToast';

export const LoginPage: React.FC = () => {
  const { state, login, toggleTheme, unlockAccount } = useBank();
  const { addToast } = useToast();
  const { copiedKey, copy } = useCopyToClipboard();
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState(
    state.auth.rememberMe ? state.auth.email : ''
  );
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(state.auth.rememberMe);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ identifier?: string; password?: string }>({});
  const [lockRemainingSec, setLockRemainingSec] = useState(0);

  // Live countdown timer when account lock simulation is active
  useEffect(() => {
    const updateTimer = () => {
      if (state.auth.lockedUntil && state.auth.lockedUntil > Date.now()) {
        setLockRemainingSec(Math.ceil((state.auth.lockedUntil - Date.now()) / 1000));
      } else {
        setLockRemainingSec(0);
      }
    };
    updateTimer();
    const interval = window.setInterval(updateTimer, 1000);
    return () => window.clearInterval(interval);
  }, [state.auth.lockedUntil]);

  const validate = () => {
    const errors: { identifier?: string; password?: string } = {};
    if (!identifier.trim()) {
      errors.identifier = 'Please enter your email or username.';
    }
    if (!password) {
      errors.password = 'Please enter your password.';
    } else if (password.length < 4) {
      errors.password = 'Password must be at least 4 characters.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await login(identifier, password, rememberMe);
      if (res.ok) {
        addToast({
          type: 'success',
          title: `Welcome back, ${state.profile.fullName}`,
          description: 'Signed in to your NovaBank simulation session.',
        });
        const from = (location.state as { from?: string } | null)?.from;
        navigate(from && from !== '/login' ? from : '/dashboard', { replace: true });
      } else {
        setFormError(res.error ?? 'Invalid credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setIdentifier(state.auth.email);
    setPassword(state.auth.password);
    setFieldErrors({});
    setFormError('');
  };

  const isLocked = lockRemainingSec > 0;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 dark:bg-navy-950">
      {/* Left Brand Showcase */}
      <div className="lg:w-[46%] bg-navy-900 text-white p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/30">
              <Shield className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight">
                Nova<span className="text-emerald-400">Bank</span>
              </span>
              <p className="text-[11px] uppercase tracking-widest text-slate-400">
                Digital Banking
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle color theme"
            className="rounded-xl border border-navy-700 bg-navy-800/70 p-2 text-slate-300 hover:text-white lg:hidden"
          >
            {state.theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
        </div>

        <div className="my-10 lg:my-0 space-y-6 max-w-md">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
            <Sparkles className="h-3.5 w-3.5" />
            Frontend-Only Banking Simulator
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
            Everyday banking clarity, built for precision.
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Explore full transfers, beneficiary management, bill payments, virtual cards, and
            spending analytics—powered locally in your browser via React state and localStorage.
          </p>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="rounded-xl border border-navy-700 bg-navy-800/50 p-3.5">
              <p className="text-xs text-slate-400">Transfer Rails</p>
              <p className="mt-1 text-sm font-semibold text-white">IMPS / NEFT</p>
            </div>
            <div className="rounded-xl border border-navy-700 bg-navy-800/50 p-3.5">
              <p className="text-xs text-slate-400">Statements</p>
              <p className="mt-1 text-sm font-semibold text-white">CSV & Print</p>
            </div>
            <div className="rounded-xl border border-navy-700 bg-navy-800/50 p-3.5">
              <p className="text-xs text-slate-400">Persistence</p>
              <p className="mt-1 text-sm font-semibold text-emerald-400">LocalStorage</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-400">
          Simulation Notice: This application uses fictional demo data only. Do not enter real
          banking credentials.
        </p>
      </div>

      {/* Right Login Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-10 sm:px-12 relative">
        <div className="hidden lg:block absolute right-8 top-8">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle color theme"
            className="rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 p-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-navy-800 transition-colors"
          >
            {state.theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
        </div>

        <div className="mx-auto w-full max-w-md space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Sign in to NovaBank
            </h2>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
              Access your simulated personal banking dashboard
            </p>
          </div>

          {/* Demo Credentials Box */}
          <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/70 dark:bg-emerald-950/25 p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                Demo Credentials
              </p>
              <button
                type="button"
                onClick={fillDemoCredentials}
                className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-2.5 py-1 text-xs font-semibold text-white transition-colors"
              >
                Auto-fill
              </button>
            </div>
            <div className="mt-2.5 space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-center justify-between">
                <span>
                  Email: <code className="font-mono font-semibold">{state.auth.email}</code>
                </span>
                <button
                  type="button"
                  onClick={() => copy(state.auth.email, 'demo-email')}
                  className="text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
                >
                  <Copy className="h-3 w-3" />
                  {copiedKey === 'demo-email' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span>
                  Password:{' '}
                  <code className="font-mono font-semibold">{state.auth.password}</code>
                </span>
                <button
                  type="button"
                  onClick={() => copy(state.auth.password, 'demo-pass')}
                  className="text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
                >
                  <Copy className="h-3 w-3" />
                  {copiedKey === 'demo-pass' ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>

          {/* Lock / Error Banner */}
          {isLocked && (
            <div className="rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-4 text-sm text-amber-900 dark:text-amber-300">
              <div className="flex items-start gap-2.5">
                <Lock className="h-4 w-4 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold">Account Temporarily Locked</p>
                  <p className="mt-0.5 text-xs">
                    Repeated failed attempts detected. Automatic unlock in{' '}
                    <span className="font-mono font-bold">{lockRemainingSec}s</span>.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      unlockAccount();
                      setFormError('');
                    }}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-semibold underline hover:no-underline"
                  >
                    <Unlock className="h-3.5 w-3.5" />
                    Reset simulated lock now
                  </button>
                </div>
              </div>
            </div>
          )}

          {formError && !isLocked && (
            <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 dark:border-rose-800/70 bg-rose-50 dark:bg-rose-950/40 p-3.5 text-xs font-medium text-rose-700 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <InputField
              label="Email or Username"
              type="text"
              autoComplete="username"
              placeholder="demo@novabank.com or alex.morgan"
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                setFieldErrors((prev) => ({ ...prev, identifier: undefined }));
              }}
              leftIcon={<Mail className="h-4 w-4" />}
              error={fieldErrors.identifier}
              disabled={isLocked || loading}
            />

            <InputField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Enter your demo password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setFieldErrors((prev) => ({ ...prev, password: undefined }));
              }}
              leftIcon={<Lock className="h-4 w-4" />}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="rounded-md p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              }
              error={fieldErrors.password}
              disabled={isLocked || loading}
            />

            <div className="flex items-center justify-between pt-1">
              <label className="inline-flex items-center gap-2 cursor-pointer text-sm text-slate-600 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span>Remember me</span>
              </label>

              <Link
                to="/forgot-password"
                className="text-sm font-medium text-navy-900 hover:text-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-300"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              disabled={isLocked}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <p className="text-center text-xs text-slate-400 dark:text-slate-500">
            Simulated authentication — state persists locally in your browser.
          </p>
        </div>
      </div>
    </div>
  );
};
