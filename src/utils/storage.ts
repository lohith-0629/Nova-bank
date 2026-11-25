import { createInitialDemoState, STATE_VERSION } from '../data/demoData';
import { NovaBankState } from '../types/banking';

const STORAGE_KEY = 'novabank_app_state_v1';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Validates parsed localStorage payload and merges missing fields with safe defaults
 * so corrupted or partial localStorage entries never crash the app.
 */
function sanitizeLoadedState(raw: unknown): NovaBankState {
  const defaults = createInitialDemoState();
  if (!isRecord(raw) || raw.version !== STATE_VERSION) {
    return defaults;
  }

  return {
    version: STATE_VERSION,
    theme: raw.theme === 'dark' ? 'dark' : 'light',
    auth: isRecord(raw.auth)
      ? {
          ...defaults.auth,
          isAuthenticated: Boolean(raw.auth.isAuthenticated),
          rememberMe:
            typeof raw.auth.rememberMe === 'boolean'
              ? raw.auth.rememberMe
              : defaults.auth.rememberMe,
          email: typeof raw.auth.email === 'string' ? raw.auth.email : defaults.auth.email,
          password:
            typeof raw.auth.password === 'string' ? raw.auth.password : defaults.auth.password,
          failedAttempts:
            typeof raw.auth.failedAttempts === 'number' ? raw.auth.failedAttempts : 0,
          lockedUntil:
            typeof raw.auth.lockedUntil === 'number' ? raw.auth.lockedUntil : null,
          lastLoginAt:
            typeof raw.auth.lastLoginAt === 'string' ? raw.auth.lastLoginAt : null,
        }
      : defaults.auth,
    profile: isRecord(raw.profile)
      ? {
          ...defaults.profile,
          ...raw.profile,
        }
      : defaults.profile,
    account: isRecord(raw.account)
      ? {
          ...defaults.account,
          ...raw.account,
          balance:
            typeof raw.account.balance === 'number' && Number.isFinite(raw.account.balance)
              ? raw.account.balance
              : defaults.account.balance,
          availableBalance:
            typeof raw.account.availableBalance === 'number' &&
            Number.isFinite(raw.account.availableBalance)
              ? raw.account.availableBalance
              : defaults.account.availableBalance,
        }
      : defaults.account,
    transactions: Array.isArray(raw.transactions)
      ? raw.transactions
      : defaults.transactions,
    beneficiaries: Array.isArray(raw.beneficiaries)
      ? raw.beneficiaries
      : defaults.beneficiaries,
    bills: Array.isArray(raw.bills) ? raw.bills : defaults.bills,
    card: isRecord(raw.card) ? { ...defaults.card, ...raw.card } : defaults.card,
    notifications: Array.isArray(raw.notifications)
      ? raw.notifications
      : defaults.notifications,
    notificationPreferences: isRecord(raw.notificationPreferences)
      ? { ...defaults.notificationPreferences, ...raw.notificationPreferences }
      : defaults.notificationPreferences,
    privacySettings: isRecord(raw.privacySettings)
      ? { ...defaults.privacySettings, ...raw.privacySettings }
      : defaults.privacySettings,
  };
}

export const storage = {
  loadState(): NovaBankState {
    try {
      const serialized = window.localStorage.getItem(STORAGE_KEY);
      if (!serialized) {
        const initial = createInitialDemoState();
        this.saveState(initial);
        return initial;
      }
      const parsed: unknown = JSON.parse(serialized);
      return sanitizeLoadedState(parsed);
    } catch {
      const fallback = createInitialDemoState();
      this.saveState(fallback);
      return fallback;
    }
  },

  saveState(state: NovaBankState): void {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore quota or storage errors gracefully
    }
  },

  resetState(preserveTheme?: 'light' | 'dark'): NovaBankState {
    const fresh = createInitialDemoState(preserveTheme ?? 'light');
    this.saveState(fresh);
    return fresh;
  },

  getRawItem<T>(key: string, fallback: T): T {
    try {
      const value = window.localStorage.getItem(key);
      if (!value) return fallback;
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  },

  setRawItem<T>(key: string, value: T): void {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore storage errors
    }
  },
};
