import React, { createContext, useCallback, useEffect, useState } from 'react';
import { createInitialDemoState } from '../data/demoData';
import {
  AppNotification,
  Beneficiary,
  BillCategory,
  BillReminder,
  NotificationPreferences,
  NotificationType,
  NovaBankState,
  PrivacySettings,
  ThemeMode,
  ToastMessage,
  Transaction,
  TransactionCategory,
  TransferMethod,
  UserProfile,
} from '../types/banking';
import { generateTransactionId, getInitials } from '../utils/format';
import { storage } from '../utils/storage';

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 60_000;

export interface TransferParams {
  recipientName: string;
  accountNumber: string;
  ifscCode: string;
  bankName?: string;
  amount: number;
  description: string;
  method: TransferMethod;
  saveBeneficiary?: boolean;
  nickname?: string;
}

export interface PayBillParams {
  category: BillCategory;
  billerName: string;
  amount: number;
  description?: string;
  billId?: string;
}

export interface BankContextValue {
  state: NovaBankState;
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  login: (
    identifier: string,
    password: string,
    rememberMe: boolean
  ) => Promise<{ ok: boolean; error?: string; lockedUntil?: number }>;
  logout: () => void;
  unlockAccount: () => void;
  resetPasswordSimulated: (email: string, newPassword: string) => { ok: boolean; error?: string };
  changePasswordSimulated: (
    currentPassword: string,
    newPassword: string
  ) => { ok: boolean; error?: string };
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  addMoney: (amount: number, source: string, note?: string) => Transaction;
  transferMoney: (params: TransferParams) => {
    ok: boolean;
    transaction?: Transaction;
    error?: string;
  };
  addBeneficiary: (data: Omit<Beneficiary, 'id' | 'createdAt'>) => Beneficiary;
  updateBeneficiary: (
    id: string,
    data: Partial<Omit<Beneficiary, 'id' | 'createdAt'>>
  ) => void;
  deleteBeneficiary: (id: string) => void;
  payBill: (params: PayBillParams) => {
    ok: boolean;
    transaction?: Transaction;
    error?: string;
  };
  addBillReminder: (data: Omit<BillReminder, 'id' | 'status'>) => BillReminder;
  deleteBillReminder: (id: string) => void;
  toggleCardFreeze: () => void;
  updateCardLimits: (dailyLimit: number, monthlyLimit: number) => void;
  updateProfile: (
    data: Partial<Pick<UserProfile, 'fullName' | 'email' | 'phone' | 'avatarColor' | 'username'>>
  ) => void;
  updateNotificationPreferences: (prefs: Partial<NotificationPreferences>) => void;
  updatePrivacySettings: (settings: Partial<PrivacySettings>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (id: string) => void;
  clearReadNotifications: () => void;
  resetDemoAccount: (keepLoggedIn?: boolean) => void;
}

export const BankContext = createContext<BankContextValue | null>(null);

function createNotification(
  type: NotificationType,
  title: string,
  message: string
): AppNotification {
  return {
    id: `notif-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    type,
    title,
    message,
    timestamp: new Date().toISOString(),
    read: false,
  };
}

function mapBillCategoryToTxnCategory(category: BillCategory): TransactionCategory {
  switch (category) {
    case 'Electricity':
    case 'Water':
    case 'Internet':
      return 'Utilities';
    case 'Mobile Recharge':
      return 'Recharge';
    case 'Rent':
      return 'Rent';
    case 'Credit Card':
      return 'Credit Card';
    default:
      return 'Other';
  }
}

export const BankProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<NovaBankState>(() => storage.loadState());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Persist to localStorage on state updates
  useEffect(() => {
    storage.saveState(state);
  }, [state]);

  // Apply theme class to root element
  useEffect(() => {
    const root = document.documentElement;
    if (state.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [state.theme]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (toast: Omit<ToastMessage, 'id'>) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev, { ...toast, id }]);
      window.setTimeout(() => {
        removeToast(id);
      }, 4200);
    },
    [removeToast]
  );

  const login = useCallback(
    async (
      identifier: string,
      password: string,
      rememberMe: boolean
    ): Promise<{ ok: boolean; error?: string; lockedUntil?: number }> => {
      // Simulate realistic async verification delay
      await new Promise((resolve) => window.setTimeout(resolve, 650));

      const now = Date.now();
      let result: { ok: boolean; error?: string; lockedUntil?: number } = { ok: false };

      setState((prev) => {
        const activeLock =
          prev.auth.lockedUntil && prev.auth.lockedUntil > now ? prev.auth.lockedUntil : null;

        if (activeLock) {
          const secs = Math.ceil((activeLock - now) / 1000);
          result = {
            ok: false,
            error: `Too many failed sign-in attempts. Account temporarily locked for ${secs}s.`,
            lockedUntil: activeLock,
          };
          return prev;
        }

        const normalized = identifier.trim().toLowerCase();
        const matchesIdentifier =
          normalized === prev.auth.email.toLowerCase() ||
          normalized === prev.profile.email.toLowerCase() ||
          normalized === prev.profile.username.toLowerCase();
        const matchesPassword = password === prev.auth.password;

        if (matchesIdentifier && matchesPassword) {
          const loginNotif = prev.notificationPreferences.loginAlerts
            ? [
                createNotification(
                  'login',
                  'Successful Sign-In',
                  'You signed in to your NovaBank simulation session.'
                ),
              ]
            : [];

          result = { ok: true };
          return {
            ...prev,
            auth: {
              ...prev.auth,
              isAuthenticated: true,
              rememberMe,
              failedAttempts: 0,
              lockedUntil: null,
              lastLoginAt: new Date().toISOString(),
            },
            notifications: [...loginNotif, ...prev.notifications],
          };
        }

        // Handle failed attempt & account lock simulation
        const baseAttempts =
          prev.auth.lockedUntil && prev.auth.lockedUntil <= now ? 0 : prev.auth.failedAttempts;
        const nextAttempts = baseAttempts + 1;

        if (nextAttempts >= MAX_FAILED_ATTEMPTS) {
          const lockUntil = now + LOCK_DURATION_MS;
          result = {
            ok: false,
            error: `Account locked for 60 seconds after ${MAX_FAILED_ATTEMPTS} consecutive failed login attempts.`,
            lockedUntil: lockUntil,
          };
          return {
            ...prev,
            auth: {
              ...prev.auth,
              failedAttempts: nextAttempts,
              lockedUntil: lockUntil,
            },
          };
        }

        const remaining = MAX_FAILED_ATTEMPTS - nextAttempts;
        result = {
          ok: false,
          error: `Invalid credentials. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining before temporary lock.`,
        };
        return {
          ...prev,
          auth: {
            ...prev.auth,
            failedAttempts: nextAttempts,
            lockedUntil: null,
          },
        };
      });

      return result;
    },
    []
  );

  const logout = useCallback(() => {
    setState((prev) => ({
      ...prev,
      auth: {
        ...prev.auth,
        isAuthenticated: false,
      },
    }));
  }, []);

  const unlockAccount = useCallback(() => {
    setState((prev) => ({
      ...prev,
      auth: {
        ...prev.auth,
        failedAttempts: 0,
        lockedUntil: null,
      },
    }));
  }, []);

  const resetPasswordSimulated = useCallback(
    (email: string, newPassword: string): { ok: boolean; error?: string } => {
      const normalized = email.trim().toLowerCase();
      if (
        normalized !== state.auth.email.toLowerCase() &&
        normalized !== state.profile.email.toLowerCase()
      ) {
        return {
          ok: false,
          error: 'No demo account matches that email address. Try demo@novabank.com.',
        };
      }

      setState((prev) => ({
        ...prev,
        auth: {
          ...prev.auth,
          password: newPassword,
          failedAttempts: 0,
          lockedUntil: null,
        },
        notifications: [
          createNotification(
            'alert',
            'Demo Password Reset',
            'Your simulated NovaBank login password was updated.'
          ),
          ...prev.notifications,
        ],
      }));
      return { ok: true };
    },
    [state.auth.email, state.profile.email]
  );

  const changePasswordSimulated = useCallback(
    (currentPassword: string, newPassword: string): { ok: boolean; error?: string } => {
      if (currentPassword !== state.auth.password) {
        return { ok: false, error: 'Current password does not match.' };
      }
      setState((prev) => ({
        ...prev,
        auth: {
          ...prev.auth,
          password: newPassword,
        },
        notifications: [
          createNotification(
            'alert',
            'Password Updated',
            'Your simulated account password was changed in settings.'
          ),
          ...prev.notifications,
        ],
      }));
      return { ok: true };
    },
    [state.auth.password]
  );

  const setTheme = useCallback((theme: ThemeMode) => {
    setState((prev) => ({ ...prev, theme }));
  }, []);

  const toggleTheme = useCallback(() => {
    setState((prev) => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }));
  }, []);

  const addMoney = useCallback(
    (amount: number, source: string, note?: string): Transaction => {
      const cleanAmount = Math.round(amount * 100) / 100;
      const newTxn: Transaction = {
        id: generateTransactionId('DEP'),
        date: new Date().toISOString(),
        description: note?.trim() ? note.trim() : `Deposit from ${source}`,
        category: 'Income',
        amount: cleanAmount,
        type: 'credit',
        status: 'Completed',
        counterparty: source,
        method: 'Direct Deposit',
        balanceAfter: Math.round((state.account.balance + cleanAmount) * 100) / 100,
      };

      setState((prev) => {
        const nextBalance = Math.round((prev.account.balance + cleanAmount) * 100) / 100;
        const nextAvailable = Math.round((prev.account.availableBalance + cleanAmount) * 100) / 100;
        const txnWithLatestBalance: Transaction = { ...newTxn, balanceAfter: nextBalance };
        const notif = prev.notificationPreferences.transfers
          ? [
              createNotification(
                'transfer',
                'Funds Added',
                `$${cleanAmount.toFixed(2)} added from ${source}. Reference: ${newTxn.id}`
              ),
            ]
          : [];

        return {
          ...prev,
          account: {
            ...prev.account,
            balance: nextBalance,
            availableBalance: nextAvailable,
          },
          transactions: [txnWithLatestBalance, ...prev.transactions],
          notifications: [...notif, ...prev.notifications],
        };
      });

      return newTxn;
    },
    [state.account.balance]
  );

  const transferMoney = useCallback(
    (
      params: TransferParams
    ): { ok: boolean; transaction?: Transaction; error?: string } => {
      const cleanAmount = Math.round(params.amount * 100) / 100;
      if (!Number.isFinite(cleanAmount) || cleanAmount <= 0) {
        return { ok: false, error: 'Transfer amount must be greater than $0.00.' };
      }
      if (cleanAmount > state.account.availableBalance) {
        return { ok: false, error: 'Insufficient available balance for this transfer.' };
      }

      const txnId = generateTransactionId('TRF');
      const nowIso = new Date().toISOString();
      const nextBalance = Math.round((state.account.balance - cleanAmount) * 100) / 100;

      const createdTxn: Transaction = {
        id: txnId,
        date: nowIso,
        description:
          params.description.trim() || `${params.method} transfer to ${params.recipientName}`,
        category: 'Transfer',
        amount: cleanAmount,
        type: 'debit',
        status: 'Completed',
        counterparty: params.recipientName.trim(),
        counterpartyAccount: params.accountNumber.trim(),
        method: params.method,
        balanceAfter: nextBalance,
      };

      setState((prev) => {
        const latestBalance = Math.round((prev.account.balance - cleanAmount) * 100) / 100;
        const latestAvailable =
          Math.round((prev.account.availableBalance - cleanAmount) * 100) / 100;
        const finalTxn = { ...createdTxn, balanceAfter: latestBalance };

        let nextBeneficiaries = prev.beneficiaries;
        if (params.saveBeneficiary) {
          const alreadyExists = prev.beneficiaries.some(
            (b) => b.accountNumber === params.accountNumber.trim()
          );
          if (!alreadyExists) {
            const newBen: Beneficiary = {
              id: `ben-${Date.now()}`,
              name: params.recipientName.trim(),
              nickname: params.nickname?.trim() || params.recipientName.trim(),
              bankName: params.bankName?.trim() || 'Partner Bank',
              accountNumber: params.accountNumber.trim(),
              ifscCode: params.ifscCode.trim().toUpperCase(),
              createdAt: nowIso,
            };
            nextBeneficiaries = [newBen, ...prev.beneficiaries];
          }
        }

        const notif = prev.notificationPreferences.transfers
          ? [
              createNotification(
                'transfer',
                `${params.method} Transfer Sent`,
                `$${cleanAmount.toFixed(2)} sent to ${params.recipientName.trim()}. Ref: ${txnId}`
              ),
            ]
          : [];

        return {
          ...prev,
          account: {
            ...prev.account,
            balance: latestBalance,
            availableBalance: latestAvailable,
          },
          transactions: [finalTxn, ...prev.transactions],
          beneficiaries: nextBeneficiaries,
          notifications: [...notif, ...prev.notifications],
        };
      });

      return { ok: true, transaction: createdTxn };
    },
    [state.account.availableBalance, state.account.balance]
  );

  const addBeneficiary = useCallback(
    (data: Omit<Beneficiary, 'id' | 'createdAt'>): Beneficiary => {
      const newBen: Beneficiary = {
        ...data,
        ifscCode: data.ifscCode.trim().toUpperCase(),
        id: `ben-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
        createdAt: new Date().toISOString(),
      };
      setState((prev) => ({
        ...prev,
        beneficiaries: [newBen, ...prev.beneficiaries],
        notifications: prev.notificationPreferences.accountActivity
          ? [
              createNotification(
                'alert',
                'Beneficiary Added',
                `${newBen.name} (${newBen.bankName}) was added to your saved beneficiaries.`
              ),
              ...prev.notifications,
            ]
          : prev.notifications,
      }));
      return newBen;
    },
    []
  );

  const updateBeneficiary = useCallback(
    (id: string, data: Partial<Omit<Beneficiary, 'id' | 'createdAt'>>) => {
      setState((prev) => ({
        ...prev,
        beneficiaries: prev.beneficiaries.map((b) =>
          b.id === id
            ? {
                ...b,
                ...data,
                ifscCode: data.ifscCode ? data.ifscCode.trim().toUpperCase() : b.ifscCode,
              }
            : b
        ),
      }));
    },
    []
  );

  const deleteBeneficiary = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      beneficiaries: prev.beneficiaries.filter((b) => b.id !== id),
    }));
  }, []);

  const payBill = useCallback(
    (params: PayBillParams): { ok: boolean; transaction?: Transaction; error?: string } => {
      const cleanAmount = Math.round(params.amount * 100) / 100;
      if (!Number.isFinite(cleanAmount) || cleanAmount <= 0) {
        return { ok: false, error: 'Payment amount must be greater than $0.00.' };
      }
      if (cleanAmount > state.account.availableBalance) {
        return { ok: false, error: 'Insufficient available balance to complete this payment.' };
      }

      const txnId = generateTransactionId('PAY');
      const nowIso = new Date().toISOString();
      const nextBalance = Math.round((state.account.balance - cleanAmount) * 100) / 100;

      const createdTxn: Transaction = {
        id: txnId,
        date: nowIso,
        description: params.description?.trim()
          ? params.description.trim()
          : `${params.category} — ${params.billerName}`,
        category: mapBillCategoryToTxnCategory(params.category),
        amount: cleanAmount,
        type: 'debit',
        status: 'Completed',
        counterparty: params.billerName.trim(),
        method: 'BillPay',
        balanceAfter: nextBalance,
      };

      setState((prev) => {
        const latestBalance = Math.round((prev.account.balance - cleanAmount) * 100) / 100;
        const latestAvailable =
          Math.round((prev.account.availableBalance - cleanAmount) * 100) / 100;
        const finalTxn = { ...createdTxn, balanceAfter: latestBalance };

        const updatedBills = params.billId
          ? prev.bills.map((bill) =>
              bill.id === params.billId
                ? {
                    ...bill,
                    status: 'Paid' as const,
                    paidAt: nowIso,
                    referenceId: txnId,
                  }
                : bill
            )
          : prev.bills;

        const notif = prev.notificationPreferences.billReminders
          ? [
              createNotification(
                'payment',
                'Bill Payment Completed',
                `$${cleanAmount.toFixed(2)} paid to ${params.billerName}. Ref: ${txnId}`
              ),
            ]
          : [];

        return {
          ...prev,
          account: {
            ...prev.account,
            balance: latestBalance,
            availableBalance: latestAvailable,
          },
          transactions: [finalTxn, ...prev.transactions],
          bills: updatedBills,
          notifications: [...notif, ...prev.notifications],
        };
      });

      return { ok: true, transaction: createdTxn };
    },
    [state.account.availableBalance, state.account.balance]
  );

  const addBillReminder = useCallback(
    (data: Omit<BillReminder, 'id' | 'status'>): BillReminder => {
      const newBill: BillReminder = {
        ...data,
        id: `bill-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
        status: 'Unpaid',
      };
      setState((prev) => ({
        ...prev,
        bills: [newBill, ...prev.bills],
        notifications: prev.notificationPreferences.billReminders
          ? [
              createNotification(
                'alert',
                'Bill Reminder Added',
                `${newBill.billerName} ($${newBill.amount.toFixed(2)}) scheduled for ${newBill.dueDate}.`
              ),
              ...prev.notifications,
            ]
          : prev.notifications,
      }));
      return newBill;
    },
    []
  );

  const deleteBillReminder = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      bills: prev.bills.filter((b) => b.id !== id),
    }));
  }, []);

  const toggleCardFreeze = useCallback(() => {
    setState((prev) => {
      const nextStatus = prev.card.status === 'Active' ? 'Frozen' : 'Active';
      return {
        ...prev,
        card: {
          ...prev.card,
          status: nextStatus,
        },
        notifications: [
          createNotification(
            'alert',
            nextStatus === 'Frozen' ? 'Virtual Card Frozen' : 'Virtual Card Unfrozen',
            `Your virtual debit card ending in ${prev.card.lastFour} is now ${nextStatus.toLowerCase()}.`
          ),
          ...prev.notifications,
        ],
      };
    });
  }, []);

  const updateCardLimits = useCallback((dailyLimit: number, monthlyLimit: number) => {
    setState((prev) => ({
      ...prev,
      card: {
        ...prev.card,
        dailyLimit,
        monthlyLimit: Math.max(dailyLimit, monthlyLimit),
      },
    }));
  }, []);

  const updateProfile = useCallback(
    (
      data: Partial<Pick<UserProfile, 'fullName' | 'email' | 'phone' | 'avatarColor' | 'username'>>
    ) => {
      setState((prev) => {
        const nextFullName = data.fullName ?? prev.profile.fullName;
        const nextEmail = data.email ?? prev.profile.email;
        return {
          ...prev,
          profile: {
            ...prev.profile,
            ...data,
            avatarInitials: getInitials(nextFullName),
          },
          account: {
            ...prev.account,
            accountHolderName: nextFullName,
          },
          card: {
            ...prev.card,
            cardholderName: nextFullName.toUpperCase(),
          },
          auth: {
            ...prev.auth,
            email: nextEmail,
          },
        };
      });
    },
    []
  );

  const updateNotificationPreferences = useCallback(
    (prefs: Partial<NotificationPreferences>) => {
      setState((prev) => ({
        ...prev,
        notificationPreferences: {
          ...prev.notificationPreferences,
          ...prefs,
        },
      }));
    },
    []
  );

  const updatePrivacySettings = useCallback((settings: Partial<PrivacySettings>) => {
    setState((prev) => ({
      ...prev,
      privacySettings: {
        ...prev.privacySettings,
        ...settings,
      },
    }));
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, read: true })),
    }));
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.filter((n) => n.id !== id),
    }));
  }, []);

  const clearReadNotifications = useCallback(() => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.filter((n) => !n.read),
    }));
  }, []);

  const resetDemoAccount = useCallback((keepLoggedIn = true) => {
    setState((prev) => {
      const fresh = createInitialDemoState(prev.theme);
      const nextState: NovaBankState = {
        ...fresh,
        auth: {
          ...fresh.auth,
          isAuthenticated: keepLoggedIn,
          lastLoginAt: keepLoggedIn ? new Date().toISOString() : fresh.auth.lastLoginAt,
        },
      };
      storage.saveState(nextState);
      return nextState;
    });
  }, []);

  return (
    <BankContext.Provider
      value={{
        state,
        toasts,
        addToast,
        removeToast,
        login,
        logout,
        unlockAccount,
        resetPasswordSimulated,
        changePasswordSimulated,
        setTheme,
        toggleTheme,
        addMoney,
        transferMoney,
        addBeneficiary,
        updateBeneficiary,
        deleteBeneficiary,
        payBill,
        addBillReminder,
        deleteBillReminder,
        toggleCardFreeze,
        updateCardLimits,
        updateProfile,
        updateNotificationPreferences,
        updatePrivacySettings,
        markNotificationRead,
        markAllNotificationsRead,
        deleteNotification,
        clearReadNotifications,
        resetDemoAccount,
      }}
    >
      {children}
    </BankContext.Provider>
  );
};
