import { useCallback, useEffect, useState } from 'react';
import apiSunset from '../../services/apiSunset';

/**
 * Carrega o cadastro de um professor pelo ID (API Sunset).
 *
 * - `teacher`: dados do professor (null enquanto não houver resposta).
 * - `loading`: true na carga inicial e durante cada `refetch`.
 * - `refetch`: recarrega o professor; útil após salvar alterações.
 *
 * @param {string|number} id ID do professor.
 * @returns {{ teacher: object|null, loading: boolean, refetch: Function }}
 */
function useTeacherForm(id) {
  const [teacher, setTeacher] = useState(null);
  // Já nasce carregando quando existe um id para buscar (evita flash de tela vazia).
  const [loading, setLoading] = useState(Boolean(id));

  const createTeacher = useCallback(async (updatedData) => {
    try {
      setLoading(true);
      const { data } = await apiSunset.post(`/teachers`, updatedData);
      console.log('createTeacher data:', data);
      setTeacher(data);
      setLoading(false);
    } catch (err) {
      console.error('Erro ao criar professor: ' + (err?.message || 'Erro desconhecido'));
      setLoading(false);
    }
  }, []);

  const updateTeacher = useCallback(
    async (updatedData) => {
      try {
        setLoading(true);
        const { data } = await apiSunset.put(`/teachers/${id}`, updatedData);
        setTeacher(data);
        setLoading(false);
      } catch (err) {
        console.error('Erro ao atualizar professor: ' + (err?.message || 'Erro desconhecido'));
        setLoading(false);
      }
    },
    [id],
  );

  const fetchData = useCallback(
    async (signal) => {
      try {
        const { data } = await apiSunset.get(`/teachers/${id}`, { signal });
        // Requisição cancelada (troca de id/desmontagem): descarta a resposta.
        if (signal?.aborted) return;
        setTeacher(data);
      } finally {
        // Não mexe no loading se esta busca foi cancelada por uma mais recente.
        if (!signal?.aborted) setLoading(false);
      }
    },
    [id],
  );

  useEffect(() => {
    if (!id) return;

    const controller = new AbortController();
    // O cleanup aborta a busca anterior antes de iniciar a próxima.
    fetchData(controller.signal).catch((err) => {
      if (controller.signal.aborted) return;
      console.error('Erro ao carregar professor: ' + (err?.message || 'Erro desconhecido'));
    });
    return () => controller.abort();
  }, [id, fetchData]);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      await fetchData();
    } catch (err) {
      console.error('Erro ao carregar professor: ' + (err?.message || 'Erro desconhecido'));
    }
  }, [fetchData]);

  return { teacher, loading, createTeacher, updateTeacher, refetch };
}

export default useTeacherForm;
