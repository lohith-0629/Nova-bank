import React, { useState } from 'react';
import { DollarSign, PlusCircle } from 'lucide-react';
import { useBank } from '../../hooks/useBank';
import { useToast } from '../../hooks/useToast';
import { formatCurrency } from '../../utils/format';
import { Button } from '../ui/Button';
import { InputField } from '../ui/InputField';
import { Modal } from '../ui/Modal';

interface AddMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FUNDING_SOURCES = [
  'Linked External Bank (Chase ••9210)',
  'Payroll Advance Simulation',
  'Savings Vault Transfer',
  'Demo Top-Up Credit',
];

export const AddMoneyModal: React.FC<AddMoneyModalProps> = ({ isOpen, onClose }) => {
  const { addMoney } = useBank();
  const { addToast } = useToast();

  const [amount, setAmount] = useState('500');
  const [source, setSource] = useState(FUNDING_SOURCES[0]);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numeric = Number(amount);
    if (!Number.isFinite(numeric) || numeric <= 0) {
      setError('Enter a valid amount greater than $0.00.');
      return;
    }
    if (numeric > 50000) {
      setError('Simulated single deposit limit is $50,000.00.');
      return;
    }

    const txn = addMoney(numeric, source, note);
    addToast({
      type: 'success',
      title: 'Funds added to account',
      description: `${formatCurrency(numeric)} credited. Ref: ${txn.id}`,
    });
    setError('');
    setNote('');
    setAmount('500');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Money (Simulated)"
      subtitle="Instantly credit your demo NovaBank balance"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-300">
            Quick Amount Presets
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[100, 500, 1000, 2500].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  setAmount(String(preset));
                  setError('');
                }}
                className={`rounded-xl border py-2 text-xs font-semibold transition-colors ${
                  Number(amount) === preset
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                    : 'border-slate-200 dark:border-navy-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-navy-800'
                }`}
              >
                +${preset}
              </button>
            ))}
          </div>
        </div>

        <InputField
          label="Deposit Amount (USD)"
          type="number"
          step="0.01"
          min="1"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
            setError('');
          }}
          leftIcon={<DollarSign className="h-4 w-4" />}
          error={error}
          required
        />

        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-300">
            Funding Source
          </label>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-navy-900 dark:focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-navy-900/10"
          >
            {FUNDING_SOURCES.map((src) => (
              <option key={src} value={src}>
                {src}
              </option>
            ))}
          </select>
        </div>

        <InputField
          label="Reference Note (Optional)"
          placeholder="e.g., Monthly savings top-up"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="secondary" leftIcon={<PlusCircle className="h-4 w-4" />}>
            Add Funds
          </Button>
        </div>
      </form>
    </Modal>
  );
};
