import dayjs from 'dayjs';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

/**
 * Formata um número como moeda brasileira (R$ 1.234,56).
 * Retorna '-' para valores nulos/indefinidos ou não numéricos.
 * @param {number|null|undefined} value
 * @returns {string}
 */
export function formatCurrency(value) {
  if (value == null || Number.isNaN(Number(value))) return '-';
  return currencyFormatter.format(Number(value));
}

/**
 * Formata uma data no padrão DD/MM/YYYY.
 * Retorna '-' para valores ausentes ou inválidos.
 * @param {string|Date|null|undefined} value
 * @returns {string}
 */
export function formatDate(value) {
  if (!value) return '-';
  const d = dayjs(value);
  return d.isValid() ? d.format('DD/MM/YYYY') : '-';
}
