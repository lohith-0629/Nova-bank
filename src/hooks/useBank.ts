import { useContext } from 'react';
import { BankContext, BankContextValue } from '../context/BankContext';

export function useBank(): BankContextValue {
  const ctx = useContext(BankContext);
  if (!ctx) {
    throw new Error('useBank must be used within a BankProvider');
  }
  return ctx;
}
