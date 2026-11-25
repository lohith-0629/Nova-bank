import React from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowUpRight,
  BellOff,
  CheckCheck,
  Receipt,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { useBank } from '../../hooks/useBank';
import { NotificationType } from '../../types/banking';
import { formatRelativeTime } from '../../utils/format';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const typeIconMap: Record<NotificationType, React.ReactNode> = {
  transfer: <ArrowUpRight className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />,
  payment: <Receipt className="h-4 w-4 text-sky-600 dark:text-sky-400" />,
  login: <ShieldCheck className="h-4 w-4 text-navy-700 dark:text-slate-300" />,
  alert: <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />,
};

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  const {
    state,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
  } = useBank();

  if (!isOpen) return null;

  const recentNotifications = state.notifications.slice(0, 6);
  const unreadCount = state.notifications.filter((n) => !n.read).length;

  return (
    <>
      <div className="fixed inset-0 z-30" onClick={onClose} aria-hidden="true" />
      <div className="absolute right-0 top-12 z-40 w-80 sm:w-96 rounded-2xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 shadow-xl animate-scale-in overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-navy-800 px-4 py-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllNotificationsRead}
              className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </button>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-navy-800">
          {recentNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
              <BellOff className="h-8 w-8 text-slate-300 dark:text-navy-600" />
              <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                All caught up
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                No notifications to display right now.
              </p>
            </div>
          ) : (
            recentNotifications.map((item) => (
              <div
                key={item.id}
                onClick={() => !item.read && markNotificationRead(item.id)}
                className={`group flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-navy-800/60 ${
                  !item.read ? 'bg-emerald-50/40 dark:bg-emerald-950/15' : ''
                }`}
              >
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-navy-800">
                  {typeIconMap[item.type]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">
                      {item.title}
                    </p>
                    {!item.read && (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                    )}
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-xs text-slate-600 dark:text-slate-400">
                    {item.message}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                    {formatRelativeTime(item.timestamp)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(item.id);
                  }}
                  aria-label="Delete notification"
                  className="opacity-0 group-hover:opacity-100 rounded-lg p-1 text-slate-400 hover:bg-slate-200/70 hover:text-rose-600 dark:hover:bg-navy-700 transition-opacity"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-slate-100 dark:border-navy-800 bg-slate-50/70 dark:bg-navy-950/50 px-4 py-2.5 text-center">
          <Link
            to="/notifications"
            onClick={onClose}
            className="text-xs font-semibold text-navy-900 hover:text-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-300"
          >
            View all notifications →
          </Link>
        </div>
      </div>
    </>
  );
};
