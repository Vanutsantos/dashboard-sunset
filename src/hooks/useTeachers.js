import { useState, useEffect, useCallback } from 'react';
// import useApi from './useApi';

const USE_API = false; // Trocar para true quando a API estiver disponível

const mockTeachers = [
  { id: 22820940, nome: 'Danilo Vieira Brito' },
  { id: 22523302, nome: 'Helloisa Moreira Eliodoro dos Santos' },
  { id: 22347007, nome: 'João Pedro de Jesus Silva' },
  { id: 23524783, nome: 'Kawan Aloiso Cambui Gomes' },
  { id: 22344097, nome: 'Luiz Eduardo Santos Almeida' },
  { id: 31144905, nome: 'Venicius Oliveira Fárias' },
  { id: 22517760, nome: 'Heitor Cristofer Santana Gonçalves' },
];

/**
 * Hook para buscar professores/consultores.
 * Atualmente retorna dados mockados.
 * Quando a API estiver disponível, basta trocar USE_API para true.
 * @param {object} options - Opções (params, immediate, etc.)
 * @returns {{ data: Array, loading: boolean, error: string|null, refetch: Function }}
 */
function useTeachers(options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (USE_API) {
        // TODO: Substituir por chamada real à API
        // const response = await api.get('/Pessoa/GetUsuarios', { params: options.params });
        // setData(response.data?.items ?? []);
      } else {
        // Simula delay de rede
        await new Promise((resolve) => setTimeout(resolve, 300));
        setData(mockTeachers);
      }
    } catch (err) {
      setError(err.message || 'Erro ao buscar professores');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data: data ?? [], loading, error, refetch: fetchData };
}

export default useTeachers;
