import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

/**
 * Hook genérico para requisições GET à API.
 * @param {string} endpoint - Caminho do endpoint (ex: '/Pessoa/GetClientes')
 * @param {object} options - Opções adicionais
 * @param {boolean} options.immediate - Se deve executar imediatamente (default: true)
 * @param {object} options.params - Query params da requisição
 */
function useApi(endpoint, { immediate = true, params = {} } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (overrideParams) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(endpoint, { params: overrideParams || params });
      setData(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [endpoint, JSON.stringify(params)]);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [fetchData, immediate]);

  return { data, loading, error, refetch: fetchData };
}

export default useApi;
