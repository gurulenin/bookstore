export const CURRENCY = {
  code: 'INR',
  symbol: '₹',
  locale: 'en-IN',
} as const;

export function formatPrice(amount: number): string {
  return `${CURRENCY.symbol}${amount.toFixed(2)}`;
}
