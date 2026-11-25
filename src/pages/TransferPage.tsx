import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Building2,
  DollarSign,
  Send,
  UserCheck,
  UserPlus,
  Users,
} from 'lucide-react';
import { TransferReceipt } from '../components/transfers/TransferReceipt';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog';
import { InputField } from '../components/ui/InputField';
import { useBank } from '../hooks/useBank';
import { useToast } from '../hooks/useToast';
import { Transaction, TransferMethod } from '../types/banking';
import { formatCurrency } from '../utils/format';
import { isValidAccountNumber, isValidIfscCode } from '../utils/validation';

const TRANSFER_METHODS: {
  id: TransferMethod;
  label: string;
  speed: string;
  note: string;
}[] = [
  { id: 'IMPS', label: 'IMPS', speed: 'Instant (24/7)', note: 'Up to $10,000 simulated' },
  { id: 'NEFT', label: 'NEFT', speed: 'Standard Batch', note: 'No minimum amount' },
  { id: 'RTGS', label: 'RTGS', speed: 'High-Value Priority', note: 'Best for $2,000+' },
];

export const TransferPage: React.FC = () => {
  const { state, transferMoney } = useBank();
  const { addToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'saved' | 'new'>('saved');
  const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState<string>(
    state.beneficiaries[0]?.id ?? ''
  );
  const [recipientName, setRecipientName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [bankName, setBankName] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [method, setMethod] = useState<TransferMethod>('IMPS');
  const [saveBeneficiary, setSaveBeneficiary] = useState(true);
  const [nickname, setNickname] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<{
    transaction: Transaction;
    ifscCode: string;
  } | null>(null);

  // Support deep-linking from Beneficiaries page
  useEffect(() => {
    const incomingId = (location.state as { beneficiaryId?: string } | null)?.beneficiaryId;
    if (incomingId) {
      const match = state.beneficiaries.find((b) => b.id === incomingId);
      if (match) {
        setMode('saved');
        setSelectedBeneficiaryId(match.id);
      }
    }
  }, [location.state, state.beneficiaries]);

  const activeBeneficiary =
    mode === 'saved'
      ? state.beneficiaries.find((b) => b.id === selectedBeneficiaryId) ?? null
      : null;

  const effectiveRecipient =
    mode === 'saved' && activeBeneficiary
      ? {
          name: activeBeneficiary.name,
          accountNumber: activeBeneficiary.accountNumber,
          ifscCode: activeBeneficiary.ifscCode,
          bankName: activeBeneficiary.bankName,
        }
      : {
          name: recipientName.trim(),
          accountNumber: accountNumber.replace(/\s+/g, ''),
          ifscCode: ifscCode.trim().toUpperCase(),
          bankName: bankName.trim() || 'Partner Bank',
        };

  const validateForm = (): boolean => {
    const nextErrors: Record<string, string> = {};

    if (mode === 'saved') {
      if (!activeBeneficiary) {
        nextErrors.beneficiary = 'Please select a saved beneficiary or add a new one.';
      }
    } else {
      if (!effectiveRecipient.name || effectiveRecipient.name.length < 2) {
        nextErrors.recipientName = 'Enter the recipient full name.';
      }
      if (!isValidAccountNumber(effectiveRecipient.accountNumber)) {
        nextErrors.accountNumber = 'Account number must be 9 to 18 digits.';
      }
      if (!isValidIfscCode(effectiveRecipient.ifscCode)) {
        nextErrors.ifscCode = 'Use valid IFSC format (e.g., NOVA0001042).';
      }
    }

    const numericAmount = Number(amount);
    if (!amount || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      nextErrors.amount = 'Enter a valid transfer amount greater than $0.00.';
    } else if (numericAmount > state.account.availableBalance) {
      nextErrors.amount = `Insufficient available balance (${formatCurrency(
        state.account.availableBalance
      )}).`;
    } else if (method === 'RTGS' && numericAmount < 2000) {
      nextErrors.amount = 'RTGS requires a minimum simulated transfer of $2,000.00.';
    }

    if (!description.trim()) {
      nextErrors.description = 'Enter a short description or reference.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleReviewTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!validateForm()) return;

    if (state.privacySettings.confirmBeforeTransfer) {
      setConfirmOpen(true);
    } else {
      executeTransfer();
    }
  };

  const executeTransfer = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    window.setTimeout(() => {
      const res = transferMoney({
        recipientName: effectiveRecipient.name,
        accountNumber: effectiveRecipient.accountNumber,
        ifscCode: effectiveRecipient.ifscCode,
        bankName: effectiveRecipient.bankName,
        amount: Number(amount),
        description: description.trim(),
        method,
        saveBeneficiary: mode === 'new' && saveBeneficiary,
        nickname: nickname.trim() || undefined,
      });

      setIsSubmitting(false);
      setConfirmOpen(false);

      if (!res.ok || !res.transaction) {
        addToast({
          type: 'error',
          title: 'Transfer failed',
          description: res.error ?? 'Unable to complete simulated transfer.',
        });
        return;
      }

      addToast({
        type: 'success',
        title: 'Transfer sent',
        description: `${formatCurrency(res.transaction.amount)} sent to ${res.transaction.counterparty}.`,
      });
      setReceipt({
        transaction: res.transaction,
        ifscCode: effectiveRecipient.ifscCode,
      });
      setAmount('');
      setDescription('');
      setRecipientName('');
      setAccountNumber('');
      setIfscCode('');
      setBankName('');
      setNickname('');
    }, 450);
  };

  if (receipt) {
    return (
      <TransferReceipt
        transaction={receipt.transaction}
        ifscCode={receipt.ifscCode}
        onNewTransfer={() => setReceipt(null)}
        onViewTransactions={() => navigate('/transactions')}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Form */}
      <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-100 dark:border-navy-800">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Send Money
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Available balance:{' '}
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {formatCurrency(state.account.availableBalance)}
              </span>
            </p>
          </div>

          <div className="inline-flex rounded-xl bg-slate-100 dark:bg-navy-800 p-1">
            <button
              type="button"
              onClick={() => {
                setMode('saved');
                setErrors({});
              }}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                mode === 'saved'
                  ? 'bg-white dark:bg-navy-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <UserCheck className="h-3.5 w-3.5" />
              Saved Beneficiary
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('new');
                setErrors({});
              }}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                mode === 'new'
                  ? 'bg-white dark:bg-navy-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <UserPlus className="h-3.5 w-3.5" />
              New Recipient
            </button>
          </div>
        </div>

        <form onSubmit={handleReviewTransfer} className="mt-5 space-y-5" noValidate>
          {mode === 'saved' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Select Beneficiary
                </label>
                <Link
                  to="/beneficiaries"
                  className="text-xs font-medium text-emerald-600 hover:underline dark:text-emerald-400"
                >
                  Manage beneficiaries
                </Link>
              </div>
              {state.beneficiaries.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 dark:border-navy-700 p-4 text-center text-xs text-slate-500">
                  No saved beneficiaries. Switch to &ldquo;New Recipient&rdquo; to send funds.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {state.beneficiaries.map((ben) => {
                    const selected = ben.id === selectedBeneficiaryId;
                    return (
                      <button
                        key={ben.id}
                        type="button"
                        onClick={() => {
                          setSelectedBeneficiaryId(ben.id);
                          setErrors((prev) => ({ ...prev, beneficiary: '' }));
                        }}
                        className={`text-left rounded-xl border p-3.5 transition-all ${
                          selected
                            ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 ring-1 ring-emerald-500'
                            : 'border-slate-200 dark:border-navy-700 hover:border-slate-300 dark:hover:border-navy-600'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                            {ben.name}
                          </p>
                          {selected && <Badge variant="success">Selected</Badge>}
                        </div>
                        <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                          {ben.bankName}
                        </p>
                        <p className="mt-1 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                          ••{ben.accountNumber.slice(-4)} · {ben.ifscCode}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
              {errors.beneficiary && (
                <p className="text-xs font-medium text-rose-600 dark:text-rose-400">
                  {errors.beneficiary}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="Recipient Name"
                  placeholder="e.g., Jordan Lee"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  error={errors.recipientName}
                  required
                />
                <InputField
                  label="Bank Name (Optional)"
                  placeholder="e.g., Horizon National Bank"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  leftIcon={<Building2 className="h-4 w-4" />}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="Account Number"
                  placeholder="9 to 18 digits"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  error={errors.accountNumber}
                  required
                />
                <InputField
                  label="IFSC-Style Code"
                  placeholder="e.g., NOVA0001042"
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                  error={errors.ifscCode}
                  hint="4 letters + 0 + 6 alphanumeric characters"
                  required
                />
              </div>

              <div className="rounded-xl border border-slate-100 dark:border-navy-800 bg-slate-50 dark:bg-navy-800/40 p-3.5 space-y-3">
                <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={saveBeneficiary}
                    onChange={(e) => setSaveBeneficiary(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  Save recipient to my beneficiaries list
                </label>
                {saveBeneficiary && (
                  <InputField
                    label="Beneficiary Nickname (Optional)"
                    placeholder="e.g., Freelance Designer"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                  />
                )}
              </div>
            </div>
          )}

          {/* Payment Method */}
          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Payment Method (Simulated)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {TRANSFER_METHODS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMethod(m.id)}
                  className={`rounded-xl border p-3 text-left transition-all ${
                    method === m.id
                      ? 'border-navy-900 dark:border-emerald-500 bg-navy-900/5 dark:bg-emerald-950/30 ring-1 ring-navy-900 dark:ring-emerald-500'
                      : 'border-slate-200 dark:border-navy-700 hover:bg-slate-50 dark:hover:bg-navy-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {m.label}
                    </span>
                    <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                      $0 fee
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">{m.speed}</p>
                  <p className="text-[11px] text-slate-400">{m.note}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Amount & Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Transfer Amount (USD)"
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
              label="Transfer Description"
              placeholder="e.g., Invoice #204 payment"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setErrors((prev) => ({ ...prev, description: '' }));
              }}
              error={errors.description}
              required
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              leftIcon={<Send className="h-4 w-4" />}
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              {state.privacySettings.confirmBeforeTransfer
                ? 'Review & Send Money'
                : 'Send Money Now'}
            </Button>
          </div>
        </form>
      </div>

      {/* Right Summary Panel */}
      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 p-5">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Transfer Summary
          </h3>
          <dl className="mt-4 space-y-3 text-xs">
            <div className="flex justify-between">
              <dt className="text-slate-500 dark:text-slate-400">From Account</dt>
              <dd className="font-mono font-medium text-slate-900 dark:text-white">
                ••{state.account.accountNumber.slice(-4)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500 dark:text-slate-400">Recipient</dt>
              <dd className="font-medium text-slate-900 dark:text-white">
                {effectiveRecipient.name || '—'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500 dark:text-slate-400">IFSC Code</dt>
              <dd className="font-mono text-slate-900 dark:text-white">
                {effectiveRecipient.ifscCode || '—'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500 dark:text-slate-400">Rail</dt>
              <dd className="font-semibold text-slate-900 dark:text-white">{method}</dd>
            </div>
            <div className="flex justify-between border-t border-slate-100 dark:border-navy-800 pt-3">
              <dt className="text-slate-500 dark:text-slate-400">Transfer Amount</dt>
              <dd className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                {Number(amount) > 0 ? formatCurrency(Number(amount)) : '$0.00'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500 dark:text-slate-400">Projected Balance</dt>
              <dd className="font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {formatCurrency(
                  Math.max(0, state.account.availableBalance - (Number(amount) || 0))
                )}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-900/60 p-5 text-xs text-slate-600 dark:text-slate-400 space-y-2">
          <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
            <Users className="h-4 w-4 text-emerald-500" />
            <span>Simulation Safeguards</span>
          </div>
          <p>
            Duplicate clicks are blocked during processing, and balances update immediately in
            localStorage with a unique transaction reference.
          </p>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={confirmOpen}
        onClose={() => !isSubmitting && setConfirmOpen(false)}
        onConfirm={executeTransfer}
        loading={isSubmitting}
        title="Confirm Simulated Transfer"
        message="Please review the recipient details and amount before sending."
        confirmLabel="Confirm & Send"
        details={
          <dl className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <dt className="text-slate-500">Recipient</dt>
              <dd className="font-semibold text-slate-900 dark:text-white">
                {effectiveRecipient.name}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Account / IFSC</dt>
              <dd className="font-mono text-slate-900 dark:text-white">
                {effectiveRecipient.accountNumber} · {effectiveRecipient.ifscCode}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Method</dt>
              <dd className="font-medium text-slate-900 dark:text-white">{method}</dd>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-navy-700">
              <dt className="text-slate-500">Amount</dt>
              <dd className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(Number(amount) || 0)}
              </dd>
            </div>
          </dl>
        }
      />
    </div>
  );
};
