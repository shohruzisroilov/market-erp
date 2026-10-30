import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMoney(amount: number | null | undefined): string {
  const value = amount || 0;
  return new Intl.NumberFormat('uz-UZ').format(Math.round(value)) + " so'm";
}

export function formatNumber(value: number | null | undefined): string {
  return new Intl.NumberFormat('uz-UZ').format(value || 0);
}

