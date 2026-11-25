import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Lock,
  ShieldCheck,
  Sliders,
  Unlock,
  Wifi,
} from 'lucide-react';
import { TransactionDetailModal } from '../components/transactions/TransactionDetailModal';
import { TransactionList } from '../components/transactions/TransactionList';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog';
import { useBank } from '../hooks/useBank';
import { useToast } from '../hooks/useToast';
import { Transaction } from '../types/banking';
import { formatCurrency } from '../utils/format';

export const CardsPage: React.FC = () => {
  const { state, toggleCardFreeze, updateCardLimits } = useBank();
  const { addToast } = useToast();

  const [freezeConfirmOpen, setFreezeConfirmOpen] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [dailyLimit, setDailyLimit] = useState(state.card.dailyLimit);
  const [monthlyLimit, setMonthlyLimit] = useState(state.card.monthlyLimit);

  const cardTransactions = useMemo(
    () =>
      state.transactions.filter(
        (t) => t.cardTransaction || t.method === 'Card'
      ),
    [state.transactions]
  );

  const isFrozen = state.card.status === 'Frozen';
  const spendRatio = Math.min(
    100,
    Math.round((state.card.monthlySpent / Math.max(1, state.card.monthlyLimit)) * 100)
  );

  const handleToggleFreeze = () => {
    toggleCardFreeze();
    setFreezeConfirmOpen(false);
    addToast({
      type: isFrozen ? 'success' : 'warning',
      title: isFrozen ? 'Card unfrozen' : 'Card frozen',
      description: isFrozen
        ? 'Your virtual debit card is active again.'
        : 'All simulated card purchases are temporarily paused.',
    });
  };

  const handleSaveLimits = () => {
    updateCardLimits(dailyLimit, monthlyLimit);
    addToast({
      type: 'success',
      title: 'Spending limits updated',
      description: `Daily: ${formatCurrency(dailyLimit)} · Monthly: ${formatCurrency(
        Math.max(dailyLimit, monthlyLimit)
      )}`,
    });
  };

  return (
    <div className="space-y-6">
      {isFrozen && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/35 px-5 py-3.5 text-sm text-amber-900 dark:text-amber-300">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <span>
              This virtual card is currently <strong>frozen</strong>. Unfreeze it anytime to resume
              card activity.
            </span>
          </div>
          <Button size="sm" variant="outline" onClick={() => setFreezeConfirmOpen(true)}>
            Unfreeze
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Virtual Card Showcase */}
        <div className="space-y-4">
          <div
            className={`relative overflow-hidden rounded-2xl p-6 text-white transition-all duration-300 border ${
              isFrozen
                ? 'bg-slate-700 border-slate-600 opacity-90'
                : 'bg-navy-900 border-navy-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-widest text-slate-400">
                  NovaBank {state.card.cardType}
                </p>
                <div className="mt-1.5">
                  <Badge variant={isFrozen ? 'warning' : 'success'}>
                    {isFrozen ? 'Frozen' : 'Active'}
                  </Badge>
                </div>
              </div>
              <Wifi className="h-5 w-5 rotate-90 text-slate-300" />
            </div>

            <div className="my-7 flex items-center gap-3">
              <div className="flex h-9 w-12 items-center justify-center rounded-lg bg-amber-300/20 border border-amber-300/40">
                <Cpu className="h-5 w-5 text-amber-300" />
              </div>
              <span className="text-xs text-slate-400">
                Virtual Card · No CVV stored
              </span>
            </div>

            <p className="font-mono text-lg sm:text-xl tracking-widest text-white">
              {state.card.maskedNumber}
            </p>

            <div className="mt-6 flex items-end justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400">
                  Cardholder
                </p>
                <p className="mt-0.5 text-sm font-semibold tracking-wide">
                  {state.card.cardholderName}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400">
                  Expires
                </p>
                <p className="mt-0.5 font-mono text-sm font-semibold">
                  {state.card.expiryDate}
                </p>
              </div>
              <span className="text-base font-bold italic tracking-wider text-emerald-400">
                {state.card.network}
              </span>
            </div>
          </div>

          <Button
            variant={isFrozen ? 'secondary' : 'outline'}
            fullWidth
            leftIcon={isFrozen ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
            onClick={() => setFreezeConfirmOpen(true)}
          >
            {isFrozen ? 'Unfreeze Virtual Card' : 'Freeze Virtual Card'}
          </Button>

          <div className="rounded-2xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 p-4 text-xs text-slate-500 dark:text-slate-400 flex items-start gap-2.5">
            <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>
              For your safety, this simulator never generates, stores, or displays real card
              numbers or CVV codes.
            </span>
          </div>
        </div>

        {/* Spending Limits & Controls */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-emerald-500" />
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                  Spending Limits
                </h2>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Monthly Usage: {spendRatio}%
              </span>
            </div>

            {/* Monthly usage bar */}
            <div className="rounded-xl bg-slate-50 dark:bg-navy-800/60 p-4 space-y-2.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">
                  Spent this month
                </span>
                <span className="font-semibold text-slate-900 dark:text-white tabular-nums">
                  {formatCurrency(state.card.monthlySpent)} of{' '}
                  {formatCurrency(state.card.monthlyLimit)}
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-navy-700">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${spendRatio}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <label
                    htmlFor="daily-limit-range"
                    className="font-medium text-slate-700 dark:text-slate-300"
                  >
                    Daily Limit
                  </label>
                  <span className="font-semibold text-slate-900 dark:text-white tabular-nums">
                    {formatCurrency(dailyLimit)}
                  </span>
                </div>
                <input
                  id="daily-limit-range"
                  type="range"
                  min={250}
                  max={10000}
                  step={250}
                  value={dailyLimit}
                  onChange={(e) => setDailyLimit(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <label
                    htmlFor="monthly-limit-range"
                    className="font-medium text-slate-700 dark:text-slate-300"
                  >
                    Monthly Limit
                  </label>
                  <span className="font-semibold text-slate-900 dark:text-white tabular-nums">
                    {formatCurrency(monthlyLimit)}
                  </span>
                </div>
                <input
                  id="monthly-limit-range"
                  type="range"
                  min={1000}
                  max={25000}
                  step={500}
                  value={monthlyLimit}
                  onChange={(e) => setMonthlyLimit(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<CheckCircle2 className="h-4 w-4" />}
                onClick={handleSaveLimits}
              >
                Save Limit Settings
              </Button>
            </div>
          </div>

          {/* Card Transactions */}
          <div className="rounded-2xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 p-5 sm:p-6">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-3">
              Recent Card Transactions
            </h3>
            <TransactionList
              transactions={cardTransactions}
              onSelect={setSelectedTxn}
              emptyTitle="No card transactions"
              emptyDescription="Virtual debit card purchases will appear here."
            />
          </div>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={freezeConfirmOpen}
        onClose={() => setFreezeConfirmOpen(false)}
        onConfirm={handleToggleFreeze}
        variant={isFrozen ? 'primary' : 'danger'}
        title={isFrozen ? 'Unfreeze Virtual Card?' : 'Freeze Virtual Card?'}
        message={
          isFrozen
            ? 'Your virtual debit card will be reactivated immediately.'
            : 'Freezing pauses new simulated card charges until you unfreeze it.'
        }
        confirmLabel={isFrozen ? 'Unfreeze Card' : 'Freeze Card'}
      />

      <TransactionDetailModal
        transaction={selectedTxn}
        onClose={() => setSelectedTxn(null)}
      />
    </div>
  );
};
