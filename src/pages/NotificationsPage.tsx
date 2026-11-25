import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  BellOff,
  Check,
  CheckCheck,
  Receipt,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { useBank } from '../hooks/useBank';
import { useToast } from '../hooks/useToast';
import { NotificationType } from '../types/banking';
import { formatDateTime } from '../utils/format';

type FilterTab = 'all' | 'unread' | NotificationType;

const iconByType: Record<NotificationType, React.ReactNode> = {
  transfer: <ArrowUpRight className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />,
  payment: <Receipt className="h-4 w-4 text-sky-600 dark:text-sky-400" />,
  login: <ShieldCheck className="h-4 w-4 text-navy-700 dark:text-slate-300" />,
  alert: <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />,
};

export const NotificationsPage: React.FC = () => {
  const {
    state,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    clearReadNotifications,
  } = useBank();
  const { addToast } = useToast();

  const [filter, setFilter] = useState<FilterTab>('all');

  const unreadCount = useMemo(
    () => state.notifications.filter((n) => !n.read).length,
    [state.notifications]
  );

  const filtered = useMemo(() => {
    return state.notifications.filter((n) => {
      if (filter === 'all') return true;
      if (filter === 'unread') return !n.read;
      return n.type === filter;
    });
  }, [filter, state.notifications]);

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              { id: 'all', label: 'All' },
              { id: 'unread', label: `Unread (${unreadCount})` },
              { id: 'transfer', label: 'Transfers' },
              { id: 'payment', label: 'Payments' },
              { id: 'login', label: 'Security' },
              { id: 'alert', label: 'Alerts' },
            ] as { id: FilterTab; label: string }[]
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
                filter === tab.id
                  ? 'bg-navy-900 text-white dark:bg-emerald-600'
                  : 'bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-navy-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              size="sm"
              variant="outline"
              leftIcon={<CheckCheck className="h-3.5 w-3.5" />}
              onClick={() => {
                markAllNotificationsRead();
                addToast({ type: 'success', title: 'All notifications marked as read' });
              }}
            >
              Mark all read
            </Button>
          )}
          {state.notifications.some((n) => n.read) && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                clearReadNotifications();
                addToast({ type: 'info', title: 'Cleared read notifications' });
              }}
            >
              Clear read
            </Button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<BellOff className="h-6 w-6" />}
          title="No notifications here"
          description="You have no notifications matching this filter."
          action={
            filter !== 'all' ? (
              <Button variant="outline" onClick={() => setFilter('all')}>
                View All Notifications
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="rounded-2xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 divide-y divide-slate-100 dark:divide-navy-800 overflow-hidden">
          {filtered.map((item) => (
            <div
              key={item.id}
              className={`flex items-start gap-4 p-4 sm:p-5 transition-colors ${
                !item.read ? 'bg-emerald-50/40 dark:bg-emerald-950/15' : ''
              }`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-navy-800">
                {iconByType[item.type]}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {item.title}
                  </p>
                  {!item.read && <Badge variant="success">Unread</Badge>}
                </div>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  {item.message}
                </p>
                <p className="mt-1.5 text-xs text-slate-400">
                  {formatDateTime(item.timestamp)}
                </p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {!item.read && (
                  <button
                    type="button"
                    onClick={() => markNotificationRead(item.id)}
                    title="Mark as read"
                    aria-label="Mark as read"
                    className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => deleteNotification(item.id)}
                  title="Delete notification"
                  aria-label="Delete notification"
                  className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
