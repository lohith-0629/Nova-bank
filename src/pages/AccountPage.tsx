import React, { useState } from 'react';
import {
  Building2,
  Check,
  Copy,
  Eye,
  EyeOff,
  Printer,
  ShieldCheck,
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useBank } from '../hooks/useBank';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';
import { useToast } from '../hooks/useToast';
import { formatCurrency, formatDate, maskAccountNumber } from '../utils/format';

export const AccountPage: React.FC = () => {
  const { state } = useBank();
  const { copiedKey, copy } = useCopyToClipboard();
  const { addToast } = useToast();
  const [showNumber, setShowNumber] = useState(
    !state.privacySettings.hideAccountNumberByDefault
  );

  const handleCopy = async (value: string, key: string, label: string) => {
    const ok = await copy(value, key);
    if (ok) {
      addToast({ type: 'success', title: `${label} copied`, description: value });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="rounded-2xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 p-6 print-only-area">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-navy-800 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-900 dark:bg-emerald-600 text-white">
              <Building2 className="h-6 w-6 text-emerald-400 dark:text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {state.account.accountType}
                </h2>
                <Badge variant="success">{state.account.status}</Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {state.account.bankName}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            leftIcon={<Printer className="h-4 w-4" />}
            onClick={() => window.print()}
            className="no-print"
          >
            Print Summary
          </Button>
        </div>

        <dl className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
          <div className="rounded-xl border border-slate-100 dark:border-navy-800 bg-slate-50/70 dark:bg-navy-800/40 p-4">
            <dt className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Account Holder Name
            </dt>
            <dd className="mt-1 text-base font-semibold text-slate-900 dark:text-white">
              {state.account.accountHolderName}
            </dd>
          </div>

          <div className="rounded-xl border border-slate-100 dark:border-navy-800 bg-slate-50/70 dark:bg-navy-800/40 p-4">
            <dt className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Account Balance
            </dt>
            <dd className="mt-1 text-base font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {formatCurrency(state.account.balance)}
            </dd>
          </div>

          <div className="rounded-xl border border-slate-100 dark:border-navy-800 bg-slate-50/70 dark:bg-navy-800/40 p-4">
            <dt className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Account Number
            </dt>
            <dd className="mt-1.5 flex items-center justify-between gap-2">
              <span className="font-mono text-base font-semibold text-slate-900 dark:text-white">
                {showNumber
                  ? state.account.accountNumber
                  : maskAccountNumber(state.account.accountNumber)}
              </span>
              <div className="flex items-center gap-1 no-print">
                <button
                  type="button"
                  onClick={() => setShowNumber((v) => !v)}
                  aria-label={showNumber ? 'Hide account number' : 'Show account number'}
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200/70 dark:hover:bg-navy-700"
                >
                  {showNumber ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(state.account.accountNumber, 'acc-num', 'Account number')
                  }
                  aria-label="Copy account number"
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200/70 dark:hover:bg-navy-700"
                >
                  {copiedKey === 'acc-num' ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </dd>
          </div>

          <div className="rounded-xl border border-slate-100 dark:border-navy-800 bg-slate-50/70 dark:bg-navy-800/40 p-4">
            <dt className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              IFSC-Style Code
            </dt>
            <dd className="mt-1.5 flex items-center justify-between gap-2">
              <span className="font-mono text-base font-semibold text-slate-900 dark:text-white">
                {state.account.ifscCode}
              </span>
              <button
                type="button"
                onClick={() => handleCopy(state.account.ifscCode, 'ifsc', 'IFSC code')}
                aria-label="Copy IFSC code"
                className="no-print inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50"
              >
                {copiedKey === 'ifsc' ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </>
                )}
              </button>
            </dd>
          </div>

          <div className="rounded-xl border border-slate-100 dark:border-navy-800 p-4">
            <dt className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Branch Name
            </dt>
            <dd className="mt-1 font-medium text-slate-900 dark:text-white">
              {state.account.branchName}
            </dd>
          </div>

          <div className="rounded-xl border border-slate-100 dark:border-navy-800 p-4">
            <dt className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Account Creation Date
            </dt>
            <dd className="mt-1 font-medium text-slate-900 dark:text-white">
              {formatDate(state.account.createdAt)}
            </dd>
          </div>
        </dl>
      </div>

      <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/70 dark:bg-emerald-950/20 p-4 flex items-start gap-3 text-xs text-emerald-900 dark:text-emerald-300">
        <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
        <p>
          All account numbers, IFSC codes, and balances displayed on NovaBank are fictional demo
          values stored locally in your browser.
        </p>
      </div>
    </div>
  );
};
