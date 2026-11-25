import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Lock,
  LogOut,
  Moon,
  RotateCcw,
  Shield,
  Sun,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog';
import { InputField } from '../components/ui/InputField';
import { useBank } from '../hooks/useBank';
import { useToast } from '../hooks/useToast';
import { validatePasswordStrength } from '../utils/validation';

export const SettingsPage: React.FC = () => {
  const {
    state,
    setTheme,
    updateNotificationPreferences,
    updatePrivacySettings,
    changePasswordSimulated,
    resetDemoAccount,
    logout,
  } = useBank();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    if (!currentPassword) {
      setPasswordError('Enter your current password.');
      return;
    }
    const strengthErr = validatePasswordStrength(newPassword);
    if (strengthErr) {
      setPasswordError(strengthErr);
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    const res = changePasswordSimulated(currentPassword, newPassword);
    if (!res.ok) {
      setPasswordError(res.error ?? 'Failed to update password.');
      return;
    }
    addToast({
      type: 'success',
      title: 'Password updated',
      description: 'Use your new password on your next sign-in.',
    });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleResetDemo = () => {
    resetDemoAccount(true);
    setResetDialogOpen(false);
    addToast({
      type: 'success',
      title: 'Demo account restored',
      description: 'Balances, transactions, beneficiaries, bills, and card reset to defaults.',
    });
  };

  const handleLogout = () => {
    logout();
    addToast({ type: 'info', title: 'Signed out' });
    navigate('/login');
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Theme Preference */}
      <section className="rounded-2xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 p-6">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Appearance & Theme
        </h2>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          Choose between crisp daylight or dark navy mode
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${
              state.theme === 'light'
                ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30 ring-1 ring-emerald-500'
                : 'border-slate-200 dark:border-navy-700 hover:bg-slate-50 dark:hover:bg-navy-800'
            }`}
          >
            <Sun className="h-5 w-5 text-amber-500" />
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Light Mode</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Clean white surfaces</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${
              state.theme === 'dark'
                ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30 ring-1 ring-emerald-500'
                : 'border-slate-200 dark:border-navy-700 hover:bg-slate-50 dark:hover:bg-navy-800'
            }`}
          >
            <Moon className="h-5 w-5 text-emerald-400" />
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Dark Navy</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Low-glare fintech UI</p>
            </div>
          </button>
        </div>
      </section>

      {/* Notification Preferences */}
      <section className="rounded-2xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-emerald-500" />
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            Notification Preferences
          </h2>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-navy-800">
          {(
            [
              {
                key: 'transfers',
                title: 'Transfer Alerts',
                desc: 'Notify when funds are sent or deposited',
              },
              {
                key: 'billReminders',
                title: 'Bill & Payment Alerts',
                desc: 'Notify for scheduled bills and completed payments',
              },
              {
                key: 'loginAlerts',
                title: 'Sign-In Security Alerts',
                desc: 'Record a notification on each simulated sign-in',
              },
              {
                key: 'accountActivity',
                title: 'Account & Beneficiary Updates',
                desc: 'Notify when beneficiaries or settings are changed',
              },
            ] as const
          ).map((item) => (
            <label
              key={item.key}
              className="flex items-center justify-between gap-4 py-3 cursor-pointer"
            >
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {item.title}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{item.desc}</p>
              </div>
              <input
                type="checkbox"
                checked={state.notificationPreferences[item.key]}
                onChange={(e) =>
                  updateNotificationPreferences({ [item.key]: e.target.checked })
                }
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
            </label>
          ))}
        </div>
      </section>

      {/* Privacy Settings */}
      <section className="rounded-2xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-emerald-500" />
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            Privacy & Transfer Safeguards
          </h2>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-navy-800">
          {(
            [
              {
                key: 'maskBalancesByDefault',
                title: 'Mask Dashboard Balances by Default',
                desc: 'Hide balances until you click the eye toggle',
              },
              {
                key: 'hideAccountNumberByDefault',
                title: 'Mask Account Numbers by Default',
                desc: 'Show only the last 4 digits across overview screens',
              },
              {
                key: 'confirmBeforeTransfer',
                title: 'Require Confirmation Before Transfers',
                desc: 'Always show a review dialog before executing money transfers',
              },
            ] as const
          ).map((item) => (
            <label
              key={item.key}
              className="flex items-center justify-between gap-4 py-3 cursor-pointer"
            >
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {item.title}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{item.desc}</p>
              </div>
              <input
                type="checkbox"
                checked={state.privacySettings[item.key]}
                onChange={(e) => updatePrivacySettings({ [item.key]: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
            </label>
          ))}
        </div>
      </section>

      {/* Change Simulated Password */}
      <section className="rounded-2xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="h-4 w-4 text-emerald-500" />
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            Change Simulated Password
          </h2>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          {passwordError && (
            <p className="rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 p-3 text-xs font-medium text-rose-700 dark:text-rose-300">
              {passwordError}
            </p>
          )}
          <InputField
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              hint="8+ chars, upper, lower, digit & symbol"
              required
            />
            <InputField
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" variant="primary">
              Update Password
            </Button>
          </div>
        </form>
      </section>

      {/* Demo Controls & Logout */}
      <section className="rounded-2xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            Session & Demo Controls
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Reset simulated data to initial defaults or sign out of your session
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            leftIcon={<RotateCcw className="h-4 w-4" />}
            onClick={() => setResetDialogOpen(true)}
          >
            Reset Demo Account
          </Button>
          <Button
            variant="danger"
            leftIcon={<LogOut className="h-4 w-4" />}
            onClick={handleLogout}
          >
            Sign Out
          </Button>
        </div>
      </section>

      <ConfirmationDialog
        isOpen={resetDialogOpen}
        onClose={() => setResetDialogOpen(false)}
        onConfirm={handleResetDemo}
        variant="danger"
        title="Reset Demo Account?"
        message="This restores the original demo balance ($24,850.75), transactions, beneficiaries, bills, card settings, and password."
        confirmLabel="Reset Demo Data"
      />
    </div>
  );
};
