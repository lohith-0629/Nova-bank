import { useBank } from './useBank';

export function useToast() {
  const { toasts, addToast, removeToast } = useBank();
  return { toasts, addToast, removeToast };
}
