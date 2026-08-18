import useApi from './useApi';

/**
 * Hook para buscar clientes da API Next Fit.
 * @param {object} options - Opções do useApi
 */
function useClients(options = {}) {
  return useApi('/Pessoa/GetClientes', options);
}

export default useClients;
