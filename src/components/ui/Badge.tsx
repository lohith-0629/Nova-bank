import React from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'navy';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const badgeStyles: Record<BadgeVariant, string> = {
  default: 'bg-slate-100 text-slate-700 dark:bg-navy-800 dark:text-slate-300',
  success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400',
  warning: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400',
  danger: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400',
  info: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-400',
  navy: 'bg-navy-900 text-white dark:bg-navy-700 dark:text-slate-100',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  children,
  className = '',
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
