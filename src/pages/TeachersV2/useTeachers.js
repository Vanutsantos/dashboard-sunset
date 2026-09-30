import { useCallback, useEffect, useState } from 'react';
import apiSunset from '../../services/apiSunset';

/**
 * Busca a lista de professores cadastrados (API Sunset).
 *
 * - `data`: professores retornados pela API ([] enquanto não carrega).
 * - `refetch`: recarrega a lista; usado após criar/excluir um professor.
 *
 * @returns {{ data: Array, loading: boolean, error: Error|null, refetch: Function }}
 */
function useTeachers() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Não liga o `loading` aqui: o efeito já inicia com loading=true e o
  // `refetch` liga quando precisa.
  const fetchData = useCallback(async (signal) => {
    try {
      const { data: teachers } = await apiSunset.get('/teachers', { signal });
      // Requisição cancelada (desmontagem/troca): descarta a resposta.
      if (signal?.aborted) return;
      setData(teachers ?? []);
      setError(null);
    } catch (err) {
      if (signal?.aborted || err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') return;
      setError(err);
      console.error('Erro: ' + (err?.message || 'Erro desconhecido'));
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    // Os setState de fetchData só acontecem após a resposta da rede, nunca de
    // forma síncrona durante o efeito.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData(controller.signal);
    return () => controller.abort();
  }, [fetchData]);

  // Recarrega a lista; usado após criar/excluir um professor.
  const refetch = useCallback(async () => {
    setLoading(true);
    await fetchData();
  }, [fetchData]);

  const deleteTeacher = useCallback(async (teacherId) => {
    try {
      await apiSunset.delete(`/teachers/${teacherId}`);
      // Atualiza a lista localmente sem precisar refazer a requisição.
      setData((prevData) => prevData.filter((teacher) => teacher._id !== teacherId));
    } catch (err) {
      console.error('Erro ao excluir professor: ' + (err?.message || 'Erro desconhecido'));
      throw err; // Propaga o erro para o chamador lidar com a mensagem.
    }
  }, []);

  return { data, loading, error, refetch, deleteTeacher };
}

export default useTeachers;
