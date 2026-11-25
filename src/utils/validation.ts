export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isValidAccountNumber(acc: string): boolean {
  const cleaned = acc.replace(/\s+/g, '');
  return /^\d{9,18}$/.test(cleaned);
}

export function isValidIfscCode(code: string): boolean {
  return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(code.trim().toUpperCase());
}

export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/[^\d+]/g, '');
  return digits.length >= 10 && digits.length <= 15;
}

export function validatePasswordStrength(password: string): string | null {
  if (password.length < 8) {
    return 'Password must be at least 8 characters long.';
  }
  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password)) {
    return 'Password must include both uppercase and lowercase letters.';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must include at least one number.';
  }
  if (!/[!@#$%^&*(),.?":{}|<>_\-+]/.test(password)) {
    return 'Password must include at least one special character.';
  }
  return null;
}
