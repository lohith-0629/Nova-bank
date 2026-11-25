import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Edit3,
  Plus,
  Search,
  Send,
  Trash2,
  Users,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog';
import { EmptyState } from '../components/ui/EmptyState';
import { InputField } from '../components/ui/InputField';
import { Modal } from '../components/ui/Modal';
import { useBank } from '../hooks/useBank';
import { useToast } from '../hooks/useToast';
import { Beneficiary } from '../types/banking';
import { isValidAccountNumber, isValidIfscCode } from '../utils/validation';

interface BeneficiaryFormState {
  name: string;
  nickname: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
}

const emptyForm: BeneficiaryFormState = {
  name: '',
  nickname: '',
  bankName: '',
  accountNumber: '',
  ifscCode: '',
};

export const BeneficiariesPage: React.FC = () => {
  const { state, addBeneficiary, updateBeneficiary, deleteBeneficiary } = useBank();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BeneficiaryFormState>(emptyForm);
  const [errors, setErrors] = useState<Partial<BeneficiaryFormState>>({});
  const [deleteTarget, setDeleteTarget] = useState<Beneficiary | null>(null);

  const filteredBeneficiaries = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return state.beneficiaries;
    return state.beneficiaries.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.nickname.toLowerCase().includes(q) ||
        b.bankName.toLowerCase().includes(q) ||
        b.accountNumber.includes(q) ||
        b.ifscCode.toLowerCase().includes(q)
    );
  }, [search, state.beneficiaries]);

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
    setModalOpen(true);
  };

  const openEditModal = (ben: Beneficiary) => {
    setEditingId(ben.id);
    setForm({
      name: ben.name,
      nickname: ben.nickname,
      bankName: ben.bankName,
      accountNumber: ben.accountNumber,
      ifscCode: ben.ifscCode,
    });
    setErrors({});
    setModalOpen(true);
  };

  const validate = (): boolean => {
    const next: Partial<BeneficiaryFormState> = {};
    if (form.name.trim().length < 2) next.name = 'Full name is required.';
    if (form.bankName.trim().length < 2) next.bankName = 'Bank name is required.';
    if (!isValidAccountNumber(form.accountNumber)) {
      next.accountNumber = 'Account number must be 9 to 18 digits.';
    }
    if (!isValidIfscCode(form.ifscCode)) {
      next.ifscCode = 'Use valid IFSC format (e.g., NOVA0001042).';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name: form.name.trim(),
      nickname: form.nickname.trim() || form.name.trim(),
      bankName: form.bankName.trim(),
      accountNumber: form.accountNumber.replace(/\s+/g, ''),
      ifscCode: form.ifscCode.trim().toUpperCase(),
    };

    if (editingId) {
      updateBeneficiary(editingId, payload);
      addToast({ type: 'success', title: 'Beneficiary updated', description: payload.name });
    } else {
      addBeneficiary(payload);
      addToast({ type: 'success', title: 'Beneficiary added', description: payload.name });
    }

    setModalOpen(false);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteBeneficiary(deleteTarget.id);
    addToast({
      type: 'info',
      title: 'Beneficiary removed',
      description: `${deleteTarget.name} was deleted from your list.`,
    });
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="w-full sm:max-w-sm">
          <InputField
            placeholder="Search by name, nickname, bank, or IFSC..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
        <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={openAddModal}>
          Add Beneficiary
        </Button>
      </div>

      {filteredBeneficiaries.length === 0 ? (
        <EmptyState
          icon={<Users className="h-6 w-6" />}
          title={search ? 'No matching beneficiaries' : 'No beneficiaries saved'}
          description={
            search
              ? 'Try another search term or clear your filter.'
              : 'Add recipients once to send simulated transfers in seconds.'
          }
          action={
            search ? (
              <Button variant="outline" onClick={() => setSearch('')}>
                Clear Search
              </Button>
            ) : (
              <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={openAddModal}>
                Add First Beneficiary
              </Button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBeneficiaries.map((ben) => (
            <div
              key={ben.id}
              className="rounded-2xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 p-5 flex flex-col justify-between gap-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy-900 text-white dark:bg-emerald-600/20 dark:text-emerald-400 font-bold text-sm">
                    {ben.name
                      .split(' ')
                      .map((p) => p[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold text-slate-900 dark:text-white">
                      {ben.name}
                    </h3>
                    <p className="truncate text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      {ben.nickname}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEditModal(ben)}
                    aria-label={`Edit ${ben.name}`}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-navy-800 dark:hover:text-white"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(ben)}
                    aria-label={`Delete ${ben.name}`}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 dark:bg-navy-800/50 p-3 space-y-1 text-xs">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Building2 className="h-3.5 w-3.5 text-slate-400" />
                  <span>{ben.bankName}</span>
                </div>
                <div className="flex justify-between font-mono text-slate-500 dark:text-slate-400 pt-1">
                  <span>Acc: {ben.accountNumber}</span>
                  <span>IFSC: {ben.ifscCode}</span>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                fullWidth
                leftIcon={<Send className="h-3.5 w-3.5" />}
                onClick={() => navigate('/transfer', { state: { beneficiaryId: ben.id } })}
              >
                Send Money
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Beneficiary' : 'Add New Beneficiary'}
        subtitle="Saved locally for quick simulated transfers"
      >
        <form onSubmit={handleSave} className="space-y-4" noValidate>
          <InputField
            label="Beneficiary Full Name"
            placeholder="e.g., Elena Rostova"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            error={errors.name}
            required
          />
          <InputField
            label="Nickname"
            placeholder="e.g., Elena Design Studio"
            value={form.nickname}
            onChange={(e) => setForm({ ...form, nickname: e.target.value })}
          />
          <InputField
            label="Bank Name"
            placeholder="e.g., Horizon National Bank"
            value={form.bankName}
            onChange={(e) => setForm({ ...form, bankName: e.target.value })}
            error={errors.bankName}
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Account Number"
              placeholder="9 to 18 digits"
              value={form.accountNumber}
              onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
              error={errors.accountNumber}
              required
            />
            <InputField
              label="IFSC-Style Code"
              placeholder="e.g., HORZ0002814"
              value={form.ifscCode}
              onChange={(e) => setForm({ ...form, ifscCode: e.target.value.toUpperCase() })}
              error={errors.ifscCode}
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingId ? 'Save Changes' : 'Add Beneficiary'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmationDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        variant="danger"
        title="Delete Beneficiary?"
        message={`Are you sure you want to remove ${deleteTarget?.name ?? 'this beneficiary'} from your saved recipients?`}
        confirmLabel="Delete"
      />
    </div>
  );
};
