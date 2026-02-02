export const API_BASE_URL = 'https://localhost:5001';

export const CURRENCY_FORMATTER = new Intl.NumberFormat('uk-UA', {
  style: 'currency',
  currency: 'UAH',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});