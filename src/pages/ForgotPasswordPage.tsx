import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  Shield,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { InputField } from '../components/ui/InputField';
import { useBank } from '../hooks/useBank';
import { useToast } from '../hooks/useToast';
import { isValidEmail, validatePasswordStrength } from '../utils/validation';

export const ForgotPasswordPage: React.FC = () => {
  const { state, resetPasswordSimulated } = useBank();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState<'email' | 'reset' | 'done'>('email');
  const [email, setEmail] = useState(state.auth.email);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleVerifyEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    const normalized = email.trim().toLowerCase();
    if (
      normalized !== state.auth.email.toLowerCase() &&
      normalized !== state.profile.email.toLowerCase()
    ) {
      setError(`No demo account found for that email. Try ${state.auth.email}.`);
      return;
    }
    setStep('reset');
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otp.trim() !== '123456') {
      setError('Enter the simulated verification code 123456.');
      return;
    }
    const strengthErr = validatePasswordStrength(newPassword);
    if (strengthErr) {
      setError(strengthErr);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const res = resetPasswordSimulated(email, newPassword);
    if (!res.ok) {
      setError(res.error ?? 'Could not reset password.');
      return;
    }

    addToast({
      type: 'success',
      title: 'Demo password updated',
      description: 'You can now sign in with your new password.',
    });
    setStep('done');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-navy-950 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 p-6 sm:p-8 shadow-sm animate-scale-in">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy-900 dark:bg-emerald-600 text-white">
            <Shield className="h-5 w-5 text-emerald-400 dark:text-white" />
          </div>
          <span className="text-lg font-bold text-navy-900 dark:text-white">
            Nova<span className="text-emerald-600 dark:text-emerald-400">Bank</span>
          </span>
        </div>

        {step === 'email' && (
          <form onSubmit={handleVerifyEmail} className="space-y-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Reset simulated password
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Enter your demo account email to receive a simulated verification code.
              </p>
            </div>

            {error && (
              <p className="rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 p-3 text-xs font-medium text-rose-700 dark:text-rose-300">
                {error}
              </p>
            )}

            <InputField
              label="Account Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="h-4 w-4" />}
              hint={`Demo account email: ${state.auth.email}`}
              required
            />

            <Button type="submit" variant="primary" fullWidth>
              Continue
            </Button>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Create new password
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Simulated verification code:{' '}
                <code className="rounded bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                  123456
                </code>
              </p>
            </div>

            {error && (
              <p className="rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 p-3 text-xs font-medium text-rose-700 dark:text-rose-300">
                {error}
              </p>
            )}

            <InputField
              label="6-Digit Verification Code"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              leftIcon={<KeyRound className="h-4 w-4" />}
              required
            />

            <InputField
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              leftIcon={<Lock className="h-4 w-4" />}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              hint="Min 8 chars, upper & lowercase, number, and symbol."
              required
            />

            <InputField
              label="Confirm New Password"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              leftIcon={<Lock className="h-4 w-4" />}
              required
            />

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('email')} fullWidth>
                Back
              </Button>
              <Button type="submit" variant="primary" fullWidth>
                Reset Password
              </Button>
            </div>
          </form>
        )}

        {step === 'done' && (
          <div className="text-center space-y-4 py-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Password Reset Complete
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Your simulated NovaBank login password has been updated locally.
            </p>
            <Button variant="primary" fullWidth onClick={() => navigate('/login')}>
              Return to Sign In
            </Button>
          </div>
        )}

        <div className="mt-6 border-t border-slate-100 dark:border-navy-800 pt-4 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
