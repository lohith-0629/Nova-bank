import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, Menu, Moon, Send, Shield, Sun } from 'lucide-react';
import { useBank } from '../../hooks/useBank';
import { PAGE_TITLES } from './navItems';
import { NotificationPanel } from './NotificationPanel';

interface HeaderProps {
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const { state, toggleTheme } = useBank();
  const [notifOpen, setNotifOpen] = useState(false);
  const location = useLocation();

  const unreadCount = state.notifications.filter((n) => !n.read).length;
  const pageInfo = PAGE_TITLES[location.pathname] ?? {
    title: 'NovaBank',
    subtitle: 'Everyday Digital Banking Simulator',
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 dark:border-navy-800 bg-white/90 dark:bg-navy-900/90 backdrop-blur-md px-4 sm:px-6 no-print">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation menu"
          className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-navy-800 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link to="/dashboard" className="flex items-center gap-2 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-900 dark:bg-emerald-600 text-white">
            <Shield className="h-4 w-4 text-emerald-400 dark:text-white" />
          </div>
        </Link>

        <div className="min-w-0">
          <h1 className="truncate text-base sm:text-lg font-semibold text-slate-900 dark:text-white">
            {pageInfo.title}
          </h1>
          <p className="hidden sm:block truncate text-xs text-slate-500 dark:text-slate-400">
            {pageInfo.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <span className="hidden xl:inline-flex items-center gap-1.5 rounded-full border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Frontend Demo Mode
        </span>

        <Link
          to="/transfer"
          className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-navy-900 dark:bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-navy-800 dark:hover:bg-emerald-500 transition-colors"
        >
          <Send className="h-3.5 w-3.5" />
          <span>Quick Transfer</span>
        </Link>

        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle color theme"
          title={state.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-800 p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-navy-700 transition-colors"
        >
          {state.theme === 'dark' ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setNotifOpen((prev) => !prev)}
            aria-label="Toggle notifications"
            className="relative rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-800 p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-navy-700 transition-colors"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          <NotificationPanel isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
        </div>

        <Link
          to="/profile"
          title="Profile"
          className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white ring-2 ring-slate-200 dark:ring-navy-700 transition-transform hover:scale-105"
          style={{ backgroundColor: state.profile.avatarColor }}
        >
          {state.profile.avatarInitials}
        </Link>
      </div>
    </header>
  );
};
