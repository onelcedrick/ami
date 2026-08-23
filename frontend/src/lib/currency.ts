// -*- coding: utf-8 -*-

export const CURRENCY_CODE = 'MGA';
export const CURRENCY_SYMBOL = 'Ar';

/**
 * Formats an amount in Malagasy Ariary (Ar)
 * Example: 1500000 -> "1 500 000 Ar"
 */
export function formatAriary(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return `0 ${CURRENCY_SYMBOL}`;
  }

  const num = Math.round(Number(amount));
  // Format with spaces as thousands separator
  const formatted = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${formatted} ${CURRENCY_SYMBOL}`;
}

export const formatPrice = formatAriary;
