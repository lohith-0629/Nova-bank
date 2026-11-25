import {
  ArrowLeftRight,
  BarChart3,
  Bell,
  Building2,
  CreditCard,
  LayoutDashboard,
  LucideIcon,
  Receipt,
  Settings,
  User,
  Users,
  Zap,
} from 'lucide-react';

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  section: 'main' | 'manage' | 'account';
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, section: 'main' },
  { label: 'Transfer', path: '/transfer', icon: ArrowLeftRight, section: 'main' },
  { label: 'Transactions', path: '/transactions', icon: Receipt, section: 'main' },
  { label: 'Payments & Bills', path: '/payments', icon: Zap, section: 'main' },
  { label: 'Cards', path: '/cards', icon: CreditCard, section: 'manage' },
  { label: 'Beneficiaries', path: '/beneficiaries', icon: Users, section: 'manage' },
  { label: 'Analytics', path: '/analytics', icon: BarChart3, section: 'manage' },
  { label: 'Account Details', path: '/account', icon: Building2, section: 'account' },
  { label: 'Notifications', path: '/notifications', icon: Bell, section: 'account' },
  { label: 'Profile', path: '/profile', icon: User, section: 'account' },
  { label: 'Settings', path: '/settings', icon: Settings, section: 'account' },
];

export const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': {
    title: 'Dashboard',
    subtitle: 'Overview of your simulated accounts, balances, and recent activity',
  },
  '/transfer': {
    title: 'Money Transfer',
    subtitle: 'Send funds locally via simulated NEFT, IMPS, or RTGS rails',
  },
  '/beneficiaries': {
    title: 'Beneficiaries',
    subtitle: 'Manage your saved recipients for faster transfers',
  },
  '/transactions': {
    title: 'Transactions',
    subtitle: 'Search, filter, inspect receipts, and export CSV statements',
  },
  '/payments': {
    title: 'Payments & Bills',
    subtitle: 'Pay utilities, recharges, and track upcoming bill reminders',
  },
  '/cards': {
    title: 'Virtual Cards',
    subtitle: 'Manage virtual debit card status, limits, and card spending',
  },
  '/analytics': {
    title: 'Financial Analytics',
    subtitle: 'Monthly cashflow, category breakdown, and weekly trends',
  },
  '/account': {
    title: 'Account Details',
    subtitle: 'Account identifiers, routing details, and verification info',
  },
  '/profile': {
    title: 'Profile',
    subtitle: 'Manage your personal information and avatar preferences',
  },
  '/notifications': {
    title: 'Notifications',
    subtitle: 'Stay updated on transfers, bill reminders, and security alerts',
  },
  '/settings': {
    title: 'Settings',
    subtitle: 'Security, privacy, theme preferences, and demo controls',
  },
};
