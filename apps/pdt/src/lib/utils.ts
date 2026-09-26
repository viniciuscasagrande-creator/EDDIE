import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatBRL(cents = 0): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
}

export function formatNumber(val = 0): string {
  return new Intl.NumberFormat('pt-BR').format(val);
}

export function formatPercent(val = 0, decimals = 1): string {
  return `${val.toFixed(decimals)}%`;
}
