import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  ArrowLeftRight,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  Receipt,
  Shield,
  X,
} from 'lucide-react';
import { useBank } from '../../hooks/useBank';
import { useToast } from '../../hooks/useToast';
import { NAV_ITEMS } from './navItems';

interface MobileNavigationProps {
  drawerOpen: boolean;
  onOpenDrawer: () => void;
  onCloseDrawer: () => void;
}

const bottomTabs = [
  { label: 'Home', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Transfer', path: '/transfer', icon: ArrowLeftRight },
  { label: 'History', path: '/transactions', icon: Receipt },
  { label: 'Cards', path: '/cards', icon: CreditCard },
];

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  drawerOpen,
  onOpenDrawer,
  onCloseDrawer,
}) => {
  const { state, logout } = useBank();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const unreadCount = state.notifications.filter((n) => !n.read).length;

  const handleLogout = () => {
    onCloseDrawer();
    logout();
    addToast({ type: 'info', title: 'Signed out' });
    navigate('/login');
  };

  return (
    <>
      {/* Slide-over drawer for tablet/mobile */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden no-print">
          <div
            className="fixed inset-0 bg-navy-950/60 backdrop-blur-xs"
            onClick={onCloseDrawer}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-white dark:bg-navy-900 border-r border-slate-200 dark:border-navy-800 shadow-2xl animate-fade-in">
            <div className="flex h-16 items-center justify-between border-b border-slate-100 dark:border-navy-800 px-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-navy-900 dark:bg-emerald-600 text-white">
                  <Shield className="h-4 w-4 text-emerald-400 dark:text-white" />
                </div>
                <span className="text-base font-bold text-navy-900 dark:text-white">
                  Nova<span className="text-emerald-600 dark:text-emerald-400">Bank</span>
                </span>
              </div>
              <button
                type="button"
                onClick={onCloseDrawer}
                aria-label="Close navigation menu"
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-navy-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isNotifications = item.path === '/notifications';
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onCloseDrawer}
                    className={({ isActive }) =>
                      `flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-navy-900 text-white dark:bg-emerald-600/20 dark:text-emerald-400'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800'
                      }`
                    }
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </span>
                    {isNotifications && unreadCount > 0 && (
                      <span className="rounded-full bg-emerald-500 px-1.5 py-0.5 text-[11px] font-bold text-white">
                        {unreadCount}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>

            <div className="border-t border-slate-100 dark:border-navy-800 p-4">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 px-4 py-2.5 text-sm font-medium text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom fixed bar on mobile */}
      <nav
        aria-label="Mobile bottom navigation"
        className="fixed bottom-0 inset-x-0 z-30 flex h-16 items-center justify-around border-t border-slate-200 dark:border-navy-800 bg-white/95 dark:bg-navy-900/95 backdrop-blur-md px-2 lg:hidden no-print"
      >
        {bottomTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 rounded-xl px-3 py-1.5 text-[11px] font-medium transition-colors ${
                  isActive
                    ? 'text-navy-900 dark:text-emerald-400'
                    : 'text-slate-500 dark:text-slate-400'
                }`
              }
            >
              <Icon className="h-5 w-5" />
              <span>{tab.label}</span>
            </NavLink>
          );
        })}
        <button
          type="button"
          onClick={onOpenDrawer}
          className="relative flex flex-col items-center justify-center gap-1 rounded-xl px-3 py-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400"
        >
          <Menu className="h-5 w-5" />
          <span>More</span>
          {unreadCount > 0 && (
            <span className="absolute right-2 top-1 h-2 w-2 rounded-full bg-emerald-500" />
          )}
        </button>
      </nav>
    </>
  );
};
