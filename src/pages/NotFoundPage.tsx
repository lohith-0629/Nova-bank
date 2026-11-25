import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useBank } from '../hooks/useBank';

export const NotFoundPage: React.FC = () => {
  const { state } = useBank();
  const target = state.auth.isAuthenticated ? '/dashboard' : '/login';

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-navy-950 px-4">
      <div className="max-w-md w-full rounded-2xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-navy-800 text-navy-900 dark:text-emerald-400">
          <Compass className="h-7 w-7" />
        </div>
        <p className="mt-4 text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
          404 Error
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
          Page not found
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          The NovaBank route you requested does not exist or may have moved.
        </p>
        <div className="mt-6">
          <Link to={target}>
            <Button variant="primary" leftIcon={<ArrowLeft className="h-4 w-4" />}>
              {state.auth.isAuthenticated ? 'Back to Dashboard' : 'Go to Sign In'}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
