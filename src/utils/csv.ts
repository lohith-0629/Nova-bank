import { Transaction } from '../types/banking';
import { formatDateTime } from './format';

function escapeCsvCell(value: string | number): string {
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function downloadTransactionsCsv(transactions: Transaction[], filename = 'novabank-statement.csv'): void {
  const headers = [
    'Transaction ID',
    'Date',
    'Description',
    'Category',
    'Type',
    'Method',
    'Counterparty',
    'Status',
    'Amount (USD)',
    'Balance After (USD)',
  ];

  const rows = transactions.map((txn) => [
    txn.id,
    formatDateTime(txn.date),
    txn.description,
    txn.category,
    txn.type.toUpperCase(),
    txn.method ?? 'Standard',
    txn.counterparty,
    txn.status,
    txn.type === 'credit' ? txn.amount.toFixed(2) : (-txn.amount).toFixed(2),
    txn.balanceAfter.toFixed(2),
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map(escapeCsvCell).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
