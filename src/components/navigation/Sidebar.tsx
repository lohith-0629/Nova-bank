import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, Shield } from 'lucide-react';
import { useBank } from '../../hooks/useBank';
import { useToast } from '../../hooks/useToast';
import { NAV_ITEMS } from './navItems';

export const Sidebar: React.FC = () => {
  const { state, logout } = useBank();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const unreadCount = state.notifications.filter((n) => !n.read).length;

  const handleLogout = () => {
    logout();
    addToast({ type: 'info', title: 'Signed out', description: 'Your demo session has ended.' });
    navigate('/login');
  };

  const renderSection = (title: string, section: 'main' | 'manage' | 'account') => {
    const items = NAV_ITEMS.filter((item) => item.section === section);
    return (
      <div className="space-y-1">
        <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {title}
        </p>
        {items.map((item) => {
          const Icon = item.icon;
          const isNotifications = item.path === '/notifications';
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-navy-900 text-white dark:bg-emerald-600/20 dark:text-emerald-400 dark:border dark:border-emerald-500/30'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800/80 hover:text-slate-900 dark:hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className="flex items-center gap-3">
                    <Icon
                      className={`h-4 w-4 transition-colors ${
                        isActive
                          ? 'text-emerald-400'
                          : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'
                      }`}
                    />
                    <span>{item.label}</span>
                  </span>
                  {isNotifications && unreadCount > 0 && (
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold leading-none ${
                        isActive
                          ? 'bg-emerald-500 text-white'
                          : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                      }`}
                    >
                      {unreadCount}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    );
  };

  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 no-print">
      {/* Brand header */}
      <div className="flex h-16 items-center gap-2.5 border-b border-slate-100 dark:border-navy-800 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy-900 dark:bg-emerald-600 text-white">
          <Shield className="h-5 w-5 text-emerald-400 dark:text-white" />
        </div>
        <div>
          <span className="text-base font-bold tracking-tight text-navy-900 dark:text-white">
            Nova<span className="text-emerald-600 dark:text-emerald-400">Bank</span>
          </span>
          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
            Digital Simulator
          </p>
        </div>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {renderSection('Banking', 'main')}
        {renderSection('Manage', 'manage')}
        {renderSection('Account', 'account')}
      </nav>

      {/* Footer user card */}
      <div className="border-t border-slate-100 dark:border-navy-800 p-3">
        <div className="flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-navy-800/70 p-2.5">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ backgroundColor: state.profile.avatarColor }}
          >
            {state.profile.avatarInitials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">
              {state.profile.fullName}
            </p>
            <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
              {state.profile.tier}
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            title="Sign out"
            aria-label="Sign out"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/70 hover:text-rose-600 dark:hover:bg-navy-700 dark:hover:text-rose-400 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
