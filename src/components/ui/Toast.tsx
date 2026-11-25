import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { ToastMessage } from '../../types/banking';

const toastStyles: Record<
  ToastMessage['type'],
  { icon: React.ReactNode; border: string; bg: string }
> = {
  success: {
    icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
    border: 'border-emerald-200 dark:border-emerald-800/60',
    bg: 'bg-white dark:bg-navy-900',
  },
  error: {
    icon: <AlertCircle className="h-5 w-5 text-rose-500" />,
    border: 'border-rose-200 dark:border-rose-800/60',
    bg: 'bg-white dark:bg-navy-900',
  },
  warning: {
    icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
    border: 'border-amber-200 dark:border-amber-800/60',
    bg: 'bg-white dark:bg-navy-900',
  },
  info: {
    icon: <Info className="h-5 w-5 text-sky-500" />,
    border: 'border-slate-200 dark:border-navy-700',
    bg: 'bg-white dark:bg-navy-900',
  },
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-20 right-4 z-50 flex flex-col gap-2.5 md:bottom-6 md:right-6 max-w-sm w-[calc(100%-2rem)] no-print"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        const style = toastStyles[toast.type];
        return (
          <div
            key={toast.id}
            className={`flex items-start gap-3 rounded-xl border ${style.border} ${style.bg} p-3.5 shadow-lg animate-slide-in-right`}
          >
            <div className="mt-0.5 shrink-0">{style.icon}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-white">{toast.title}</p>
              {toast.description && (
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {toast.description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss notification"
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-navy-800 dark:hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
