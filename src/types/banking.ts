export type ThemeMode = 'light' | 'dark';

export type TransactionType = 'credit' | 'debit';

export type TransactionStatus = 'Completed' | 'Pending' | 'Failed';

export type TransactionCategory =
  | 'Income'
  | 'Transfer'
  | 'Utilities'
  | 'Dining'
  | 'Shopping'
  | 'Subscription'
  | 'Rent'
  | 'Recharge'
  | 'Credit Card'
  | 'Other';

export type TransferMethod = 'NEFT' | 'IMPS' | 'RTGS';

export interface Transaction {
  id: string;
  date: string; // ISO string
  description: string;
  category: TransactionCategory;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  counterparty: string;
  counterpartyAccount?: string;
  method?: TransferMethod | 'Card' | 'BillPay' | 'Direct Deposit';
  balanceAfter: number;
  cardTransaction?: boolean;
}

export interface Beneficiary {
  id: string;
  name: string;
  nickname: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  createdAt: string;
}

export type BillCategory =
  | 'Electricity'
  | 'Water'
  | 'Internet'
  | 'Mobile Recharge'
  | 'Rent'
  | 'Credit Card'
  | 'Other';

export type BillStatus = 'Paid' | 'Unpaid';

export interface BillReminder {
  id: string;
  title: string;
  billerName: string;
  category: BillCategory;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  status: BillStatus;
  paidAt?: string;
  referenceId?: string;
  notes?: string;
}

export type CardStatus = 'Active' | 'Frozen';

export interface CardInfo {
  id: string;
  cardholderName: string;
  maskedNumber: string;
  lastFour: string;
  expiryDate: string;
  status: CardStatus;
  dailyLimit: number;
  monthlyLimit: number;
  monthlySpent: number;
  cardType: string;
  network: string;
}

export type NotificationType = 'transfer' | 'payment' | 'login' | 'alert';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string; // ISO string
  read: boolean;
}

export interface UserProfile {
  id: string;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  avatarColor: string;
  avatarInitials: string;
  memberSince: string;
  tier: string;
}

export interface NotificationPreferences {
  transfers: boolean;
  billReminders: boolean;
  loginAlerts: boolean;
  accountActivity: boolean;
}

export interface PrivacySettings {
  maskBalancesByDefault: boolean;
  hideAccountNumberByDefault: boolean;
  confirmBeforeTransfer: boolean;
}

export interface AccountDetails {
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  branchName: string;
  accountType: string;
  status: 'Active' | 'Restricted';
  createdAt: string;
  balance: number;
  availableBalance: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  rememberMe: boolean;
  email: string;
  password: string; // Simulated frontend-only demo password
  failedAttempts: number;
  lockedUntil: number | null;
  lastLoginAt: string | null;
}

export interface NovaBankState {
  version: number;
  theme: ThemeMode;
  auth: AuthState;
  profile: UserProfile;
  account: AccountDetails;
  transactions: Transaction[];
  beneficiaries: Beneficiary[];
  bills: BillReminder[];
  card: CardInfo;
  notifications: AppNotification[];
  notificationPreferences: NotificationPreferences;
  privacySettings: PrivacySettings;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  description?: string;
}
