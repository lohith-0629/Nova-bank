import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, Save, Settings, ShieldCheck, User } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { InputField } from '../components/ui/InputField';
import { useBank } from '../hooks/useBank';
import { useToast } from '../hooks/useToast';
import { formatDate } from '../utils/format';
import { isValidEmail, isValidPhone } from '../utils/validation';

const AVATAR_COLORS = [
  { label: 'Navy', value: '#0B132B' },
  { label: 'Emerald', value: '#059669' },
  { label: 'Slate', value: '#334155' },
  { label: 'Indigo', value: '#3730A3' },
  { label: 'Teal', value: '#0F766E' },
];

export const ProfilePage: React.FC = () => {
  const { state, updateProfile } = useBank();
  const { addToast } = useToast();

  const [fullName, setFullName] = useState(state.profile.fullName);
  const [username, setUsername] = useState(state.profile.username);
  const [email, setEmail] = useState(state.profile.email);
  const [phone, setPhone] = useState(state.profile.phone);
  const [avatarColor, setAvatarColor] = useState(state.profile.avatarColor);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (fullName.trim().length < 2) nextErrors.fullName = 'Full name is required.';
    if (username.trim().length < 3) nextErrors.username = 'Username must be at least 3 chars.';
    if (!isValidEmail(email)) nextErrors.email = 'Enter a valid email address.';
    if (!isValidPhone(phone)) nextErrors.phone = 'Enter a valid phone number.';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    updateProfile({
      fullName: fullName.trim(),
      username: username.trim(),
      email: email.trim(),
      phone: phone.trim(),
      avatarColor,
    });
    addToast({
      type: 'success',
      title: 'Profile updated',
      description: 'Your simulated profile changes were saved to localStorage.',
    });
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header Summary Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-xl font-bold text-white transition-colors"
            style={{ backgroundColor: avatarColor }}
          >
            {fullName
              .trim()
              .split(/\s+/)
              .map((p) => p[0])
              .join('')
              .slice(0, 2)
              .toUpperCase() || state.profile.avatarInitials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {state.profile.fullName}
              </h2>
              <Badge variant="success">{state.profile.tier}</Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              @{state.profile.username} · Member since {formatDate(state.profile.memberSince)}
            </p>
          </div>
        </div>

        <Link
          to="/settings"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-navy-700 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-navy-800"
        >
          <Settings className="h-3.5 w-3.5" />
          Security & Theme Settings
        </Link>
      </div>

      {/* Edit Personal Info */}
      <form
        onSubmit={handleSave}
        className="rounded-2xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 p-6 space-y-5"
        noValidate
      >
        <div className="border-b border-slate-100 dark:border-navy-800 pb-4">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            Personal Details
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Changes sync across your account summary and virtual cardholder name
          </p>
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-300">
            Avatar Accent Color
          </label>
          <div className="flex flex-wrap gap-2.5">
            {AVATAR_COLORS.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => setAvatarColor(color.value)}
                className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-medium transition-all ${
                  avatarColor === color.value
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                    : 'border-slate-200 dark:border-navy-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                <span
                  className="h-3.5 w-3.5 rounded-full"
                  style={{ backgroundColor: color.value }}
                />
                {color.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField
            label="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            leftIcon={<User className="h-4 w-4" />}
            error={errors.fullName}
            required
          />
          <InputField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            error={errors.username}
            required
          />
          <InputField
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="h-4 w-4" />}
            error={errors.email}
            required
          />
          <InputField
            label="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            leftIcon={<Phone className="h-4 w-4" />}
            error={errors.phone}
            required
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            Stored locally in browser
          </span>
          <Button type="submit" variant="primary" leftIcon={<Save className="h-4 w-4" />}>
            Save Profile
          </Button>
        </div>
      </form>
    </div>
  );
};
