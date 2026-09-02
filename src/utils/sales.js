/**
 * Soma o valorTotal de uma lista de vendas, ignorando valores ausentes.
 * @param {Array<{valorTotal?: number}>} sales
 * @returns {number}
 */
export function sumSalesTotal(sales) {
  if (!Array.isArray(sales)) return 0;
  return sales.reduce((sum, sale) => sum + (Number(sale?.valorTotal) || 0), 0);
}

const STATUS_COLORS = {
  Concluida: 'green',
  Pendente: 'orange',
  Cancelada: 'red',
};

/**
 * Retorna a cor de Tag do Antd para um status de venda.
 * @param {string} status
 * @returns {string}
 */
export function statusColor(status) {
  return STATUS_COLORS[status] || 'default';
}
