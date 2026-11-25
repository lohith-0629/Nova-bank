import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeftRight,
  Eye,
  EyeOff,
  History,
  PlusCircle,
  Zap,
} from 'lucide-react';
import { useBank } from '../../hooks/useBank';
import { formatCurrency, maskAccountNumber } from '../../utils/format';

interface BalanceCardProps {
  onOpenAddMoney: () => void;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({ onOpenAddMoney }) => {
  const { state } = useBank();
  const [showAccountNumber, setShowAccountNumber] = useState(
    !state.privacySettings.hideAccountNumberByDefault
  );
  const [hideBalances, setHideBalances] = useState(
    state.privacySettings.maskBalancesByDefault
  );

  return (
    <div className="rounded-2xl bg-navy-900 dark:bg-navy-900 border border-navy-800 p-6 text-white shadow-sm">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {state.account.accountType}
            </span>
            <button
              type="button"
              onClick={() => setShowAccountNumber((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-full bg-navy-800 px-3 py-1 text-xs font-mono text-slate-300 hover:bg-navy-700 transition-colors"
            >
              <span>
                {showAccountNumber
                  ? state.account.accountNumber
                  : maskAccountNumber(state.account.accountNumber)}
              </span>
              {showAccountNumber ? (
                <EyeOff className="h-3.5 w-3.5 text-slate-400" />
              ) : (
                <Eye className="h-3.5 w-3.5 text-slate-400" />
              )}
            </button>
          </div>

          <div className="mt-5 flex flex-wrap items-end gap-8">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  Current Balance
                </p>
                <button
                  type="button"
                  onClick={() => setHideBalances((v) => !v)}
                  aria-label={hideBalances ? 'Show balances' : 'Hide balances'}
                  className="rounded p-0.5 text-slate-400 hover:text-white transition-colors"
                >
                  {hideBalances ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                </button>
              </div>
              <p className="mt-1 text-3xl sm:text-4xl font-bold tracking-tight tabular-nums">
                {hideBalances ? '••••••••' : formatCurrency(state.account.balance)}
              </p>
            </div>

            <div className="border-l border-navy-700 pl-6">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Available Balance
              </p>
              <p className="mt-1 text-lg sm:text-xl font-semibold text-emerald-400 tabular-nums">
                {hideBalances ? '••••••' : formatCurrency(state.account.availableBalance)}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 lg:w-auto">
          <Link
            to="/transfer"
            className="flex flex-col items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-3 text-xs font-semibold text-white transition-colors"
          >
            <ArrowLeftRight className="h-4 w-4" />
            <span>Transfer</span>
          </Link>

          <button
            type="button"
            onClick={onOpenAddMoney}
            className="flex flex-col items-center justify-center gap-1.5 rounded-xl bg-navy-800 hover:bg-navy-700 border border-navy-700 px-4 py-3 text-xs font-semibold text-slate-100 transition-colors"
          >
            <PlusCircle className="h-4 w-4 text-emerald-400" />
            <span>Add Money</span>
          </button>

          <Link
            to="/payments"
            className="flex flex-col items-center justify-center gap-1.5 rounded-xl bg-navy-800 hover:bg-navy-700 border border-navy-700 px-4 py-3 text-xs font-semibold text-slate-100 transition-colors"
          >
            <Zap className="h-4 w-4 text-emerald-400" />
            <span>Pay Bills</span>
          </Link>

          <Link
            to="/transactions"
            className="flex flex-col items-center justify-center gap-1.5 rounded-xl bg-navy-800 hover:bg-navy-700 border border-navy-700 px-4 py-3 text-xs font-semibold text-slate-100 transition-colors"
          >
            <History className="h-4 w-4 text-emerald-400" />
            <span>History</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
