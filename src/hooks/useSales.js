import useApi from './useApi';

/**
 * Hook para buscar vendas da API Next Fit.
 * @param {object} options - Opções do useApi
 */
function useSales(options = {}) {
  return useApi('/Venda', options);
}

export default useSales;
