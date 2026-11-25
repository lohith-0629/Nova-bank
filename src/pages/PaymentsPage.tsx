import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Calendar,
  Check,
  CheckCircle2,
  Copy,
  CreditCard,
  DollarSign,
  Droplets,
  Home,
  MoreHorizontal,
  Plus,
  Printer,
  Smartphone,
  Trash2,
  Wifi,
  Zap,
} from 'lucide-react';
import { TransactionDetailModal } from '../components/transactions/TransactionDetailModal';
import { TransactionList } from '../components/transactions/TransactionList';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog';
import { InputField } from '../components/ui/InputField';
import { Modal } from '../components/ui/Modal';
import { useBank } from '../hooks/useBank';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';
import { useToast } from '../hooks/useToast';
import { BillCategory, BillReminder, Transaction } from '../types/banking';
import { formatCurrency, formatDate, formatDateTime } from '../utils/format';

const BILL_CATEGORIES: {
  id: BillCategory;
  label: string;
  icon: React.ReactNode;
  providers: string[];
}[] = [
  {
    id: 'Electricity',
    label: 'Electricity',
    icon: <Zap className="h-4 w-4" />,
    providers: ['Pacific Gas & Electric', 'ConEdison Power', 'Metro Grid Energy'],
  },
  {
    id: 'Water',
    label: 'Water',
    icon: <Droplets className="h-4 w-4" />,
    providers: ['SF Public Utilities', 'City Water Works', 'ClearStream Municipal'],
  },
  {
    id: 'Internet',
    label: 'Internet',
    icon: <Wifi className="h-4 w-4" />,
    providers: ['Sonic Fiber Networks', 'Comcast Xfinity', 'AT&T Fiber'],
  },
  {
    id: 'Mobile Recharge',
    label: 'Mobile Recharge',
    icon: <Smartphone className="h-4 w-4" />,
    providers: ['Verizon Wireless', 'T-Mobile US', 'AT&T Mobility'],
  },
  {
    id: 'Rent',
    label: 'Rent',
    icon: <Home className="h-4 w-4" />,
    providers: ['Apex Property Management', 'Skyline Residential'],
  },
  {
    id: 'Credit Card',
    label: 'Credit Card',
    icon: <CreditCard className="h-4 w-4" />,
    providers: ['NovaBank Card Services', 'Sapphire Rewards Card'],
  },
  {
    id: 'Other',
    label: 'Other',
    icon: <MoreHorizontal className="h-4 w-4" />,
    providers: ['Municipal Tax Portal', 'Gym & Wellness Club'],
  },
];

export const PaymentsPage: React.FC = () => {
  const { state, payBill, addBillReminder, deleteBillReminder } = useBank();
  const { addToast } = useToast();
  const { copiedKey, copy } = useCopyToClipboard();
  const location = useLocation();

  const [category, setCategory] = useState<BillCategory>('Electricity');
  const [billerName, setBillerName] = useState('Pacific Gas & Electric');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [activeBillId, setActiveBillId] = useState<string | undefined>(undefined);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [receiptTxn, setReceiptTxn] = useState<Transaction | null>(null);
  const [selectedHistoryTxn, setSelectedHistoryTxn] = useState<Transaction | null>(null);

  // Add Bill Reminder Modal State
  const [reminderOpen, setReminderOpen] = useState(false);
  const [remTitle, setRemTitle] = useState('');
  const [remBiller, setRemBiller] = useState('');
  const [remCategory, setRemCategory] = useState<BillCategory>('Electricity');
  const [remAmount, setRemAmount] = useState('');
  const [remDueDate, setRemDueDate] = useState('');
  const [remError, setRemError] = useState('');

  // Support clicking "Pay now" from Dashboard upcoming bills
  useEffect(() => {
    const incomingBillId = (location.state as { billId?: string } | null)?.billId;
    if (incomingBillId) {
      const target = state.bills.find((b) => b.id === incomingBillId && b.status === 'Unpaid');
      if (target) {
        selectBillForPayment(target);
      }
    }
  }, [location.state, state.bills]);

  const selectBillForPayment = (bill: BillReminder) => {
    setCategory(bill.category);
    setBillerName(bill.billerName);
    setAmount(String(bill.amount));
    setNote(bill.title);
    setActiveBillId(bill.id);
    setErrors({});
  };

  const currentProviders =
    BILL_CATEGORIES.find((c) => c.id === category)?.providers ?? [];

  const handleCategoryChange = (nextCat: BillCategory) => {
    setCategory(nextCat);
    const catInfo = BILL_CATEGORIES.find((c) => c.id === nextCat);
    setBillerName(catInfo?.providers[0] ?? '');
    setActiveBillId(undefined);
  };

  const handleReviewPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!billerName.trim()) nextErrors.billerName = 'Enter a provider or biller name.';
    const num = Number(amount);
    if (!amount || !Number.isFinite(num) || num <= 0) {
      nextErrors.amount = 'Enter a valid payment amount greater than $0.00.';
    } else if (num > state.account.availableBalance) {
      nextErrors.amount = `Insufficient balance (${formatCurrency(
        state.account.availableBalance
      )}).`;
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      setConfirmOpen(true);
    }
  };

  const confirmPayment = () => {
    const res = payBill({
      category,
      billerName: billerName.trim(),
      amount: Number(amount),
      description: note.trim() || undefined,
      billId: activeBillId,
    });
    setConfirmOpen(false);

    if (!res.ok || !res.transaction) {
      addToast({
        type: 'error',
        title: 'Payment failed',
        description: res.error ?? 'Could not process bill payment.',
      });
      return;
    }

    addToast({
      type: 'success',
      title: 'Bill paid successfully',
      description: `${formatCurrency(res.transaction.amount)} paid to ${billerName.trim()}.`,
    });
    setReceiptTxn(res.transaction);
    setAmount('');
    setNote('');
    setActiveBillId(undefined);
  };

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(remAmount);
    if (!remTitle.trim() || !remBiller.trim() || !remDueDate || !Number.isFinite(num) || num <= 0) {
      setRemError('Please fill in title, biller, due date, and a valid amount.');
      return;
    }
    addBillReminder({
      title: remTitle.trim(),
      billerName: remBiller.trim(),
      category: remCategory,
      amount: num,
      dueDate: remDueDate,
    });
    addToast({
      type: 'success',
      title: 'Bill reminder added',
      description: `${remTitle.trim()} scheduled for ${formatDate(remDueDate)}.`,
    });
    setRemTitle('');
    setRemBiller('');
    setRemAmount('');
    setRemDueDate('');
    setRemError('');
    setReminderOpen(false);
  };

  const paymentHistory = useMemo(
    () =>
      state.transactions.filter(
        (t) =>
          t.method === 'BillPay' ||
          ['Utilities', 'Recharge', 'Rent', 'Credit Card'].includes(t.category)
      ),
    [state.transactions]
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Make a Payment */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 p-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-navy-800 pb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Pay a Bill or Recharge
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Available balance:{' '}
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {formatCurrency(state.account.availableBalance)}
                </span>
              </p>
            </div>
            {activeBillId && <Badge variant="info">Paying Scheduled Bill</Badge>}
          </div>

          <form onSubmit={handleReviewPayment} className="mt-5 space-y-5" noValidate>
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Select Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {BILL_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-medium transition-all ${
                      category === cat.id
                        ? 'border-navy-900 bg-navy-900 text-white dark:border-emerald-500 dark:bg-emerald-600'
                        : 'border-slate-200 dark:border-navy-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-navy-800'
                    }`}
                  >
                    {cat.icon}
                    <span className="truncate">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Suggested Billers
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {currentProviders.map((prov) => (
                  <button
                    key={prov}
                    type="button"
                    onClick={() => setBillerName(prov)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                      billerName === prov
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                        : 'border-slate-200 dark:border-navy-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-navy-800'
                    }`}
                  >
                    {prov}
                  </button>
                ))}
              </div>

              <InputField
                label="Provider / Biller Name"
                placeholder="Enter provider or biller name"
                value={billerName}
                onChange={(e) => {
                  setBillerName(e.target.value);
                  setErrors((prev) => ({ ...prev, billerName: '' }));
                }}
                error={errors.billerName}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="Payment Amount (USD)"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setErrors((prev) => ({ ...prev, amount: '' }));
                }}
                leftIcon={<DollarSign className="h-4 w-4" />}
                error={errors.amount}
                required
              />
              <InputField
                label="Consumer / Reference Note"
                placeholder="e.g., Meter #44012 or Nov Bill"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" variant="primary" size="lg">
                Review & Pay Bill
              </Button>
            </div>
          </form>
        </div>

        {/* Right: Upcoming & Paid Bills */}
        <div className="rounded-2xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Bill Reminders
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Track due dates & status
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Plus className="h-3.5 w-3.5" />}
              onClick={() => setReminderOpen(true)}
            >
              Add Bill
            </Button>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[420px]">
            {state.bills.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-500">
                No bill reminders yet. Click &ldquo;Add Bill&rdquo; to create one.
              </p>
            ) : (
              state.bills.map((bill) => (
                <div
                  key={bill.id}
                  className="rounded-xl border border-slate-100 dark:border-navy-800 bg-slate-50/70 dark:bg-navy-800/40 p-3.5 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                        {bill.title}
                      </p>
                      <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                        {bill.billerName} · {bill.category}
                      </p>
                    </div>
                    <Badge variant={bill.status === 'Paid' ? 'success' : 'warning'}>
                      {bill.status}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400">
                      <Calendar className="h-3.5 w-3.5" />
                      Due {formatDate(bill.dueDate)}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                      {formatCurrency(bill.amount)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    {bill.status === 'Unpaid' ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        fullWidth
                        onClick={() => selectBillForPayment(bill)}
                      >
                        Pay Now
                      </Button>
                    ) : (
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                        Paid {bill.paidAt ? formatDate(bill.paidAt) : ''}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        deleteBillReminder(bill.id);
                        addToast({ type: 'info', title: 'Bill reminder removed' });
                      }}
                      aria-label="Delete bill reminder"
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Payment History */}
      <section className="rounded-2xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 p-5 sm:p-6">
        <div className="mb-3">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            Payment History
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Completed bill payments, utilities, rent, and recharges
          </p>
        </div>
        <TransactionList
          transactions={paymentHistory}
          onSelect={setSelectedHistoryTxn}
          emptyTitle="No bill payments yet"
          emptyDescription="Completed utility, recharge, and bill payments will appear here."
        />
      </section>

      <TransactionDetailModal
        transaction={selectedHistoryTxn}
        onClose={() => setSelectedHistoryTxn(null)}
      />

      {/* Confirm Payment Dialog */}
      <ConfirmationDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmPayment}
        title="Confirm Bill Payment"
        message="Review the biller and amount before submitting your simulated payment."
        confirmLabel="Pay Now"
        details={
          <dl className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <dt className="text-slate-500">Category</dt>
              <dd className="font-medium text-slate-900 dark:text-white">{category}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Biller</dt>
              <dd className="font-semibold text-slate-900 dark:text-white">{billerName}</dd>
            </div>
            <div className="flex justify-between border-t border-slate-200 dark:border-navy-700 pt-1">
              <dt className="text-slate-500">Amount</dt>
              <dd className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(Number(amount) || 0)}
              </dd>
            </div>
          </dl>
        }
      />

      {/* Payment Receipt Modal */}
      <Modal
        isOpen={Boolean(receiptTxn)}
        onClose={() => setReceiptTxn(null)}
        title="Payment Receipt"
        footer={
          <>
            <Button
              variant="outline"
              leftIcon={<Printer className="h-4 w-4" />}
              onClick={() => window.print()}
            >
              Print
            </Button>
            <Button variant="primary" onClick={() => setReceiptTxn(null)}>
              Done
            </Button>
          </>
        }
      >
        {receiptTxn && (
          <div className="print-only-area space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Payment Successful
              </p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
                {formatCurrency(receiptTxn.amount)}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-navy-800 p-3 flex items-center justify-between text-xs">
              <span className="text-slate-500">Ref ID</span>
              <span className="flex items-center gap-1.5 font-mono font-semibold text-slate-900 dark:text-white">
                {receiptTxn.id}
                <button
                  type="button"
                  onClick={() => copy(receiptTxn.id, 'bill-ref')}
                  className="no-print text-slate-400 hover:text-emerald-500"
                >
                  {copiedKey === 'bill-ref' ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </span>
            </div>
            <dl className="divide-y divide-slate-100 dark:divide-navy-800 text-xs text-left">
              <div className="flex justify-between py-2">
                <dt className="text-slate-500">Biller</dt>
                <dd className="font-medium text-slate-900 dark:text-white">
                  {receiptTxn.counterparty}
                </dd>
              </div>
              <div className="flex justify-between py-2">
                <dt className="text-slate-500">Paid At</dt>
                <dd className="text-slate-900 dark:text-white">
                  {formatDateTime(receiptTxn.date)}
                </dd>
              </div>
              <div className="flex justify-between py-2">
                <dt className="text-slate-500">Remaining Balance</dt>
                <dd className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(receiptTxn.balanceAfter)}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </Modal>

      {/* Add Bill Reminder Modal */}
      <Modal
        isOpen={reminderOpen}
        onClose={() => setReminderOpen(false)}
        title="Add Bill Reminder"
        subtitle="Create an upcoming bill reminder in localStorage"
      >
        <form onSubmit={handleAddReminder} className="space-y-4">
          {remError && (
            <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
              {remError}
            </p>
          )}
          <InputField
            label="Bill Title"
            placeholder="e.g., Fiber Internet Monthly"
            value={remTitle}
            onChange={(e) => setRemTitle(e.target.value)}
            required
          />
          <InputField
            label="Biller Name"
            placeholder="e.g., Sonic Fiber Networks"
            value={remBiller}
            onChange={(e) => setRemBiller(e.target.value)}
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Category
              </label>
              <select
                value={remCategory}
                onChange={(e) => setRemCategory(e.target.value as BillCategory)}
                className="w-full rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 px-3 py-2.5 text-sm"
              >
                {BILL_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <InputField
              label="Amount (USD)"
              type="number"
              step="0.01"
              min="1"
              value={remAmount}
              onChange={(e) => setRemAmount(e.target.value)}
              required
            />
          </div>
          <InputField
            label="Due Date"
            type="date"
            value={remDueDate}
            onChange={(e) => setRemDueDate(e.target.value)}
            required
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setReminderOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Reminder
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
