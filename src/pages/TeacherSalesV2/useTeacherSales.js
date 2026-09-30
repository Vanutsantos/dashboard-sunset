import { useCallback, useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';
import apiSunset from '../../services/apiSunset';
import { agruparVendasPorCliente, somarValorTotal } from './utils';

/**
 * Carrega o cadastro do professor e as vendas do mês selecionado.
 *
 * - `groups`: vendas agrupadas por cliente, já ordenadas.
 * - `total`: soma dos valores das vendas do mês.
 * - `refetch`: recarrega os dados (usado após criar/excluir venda ou alterar
 *   a porcentagem). Não recebe signal, então sempre atualiza o loading.
 *
 * O StrictMode executa os efeitos duas vezes em desenvolvimento; a chave
 * (`professor|mês`) evita disparar a mesma busca em duplicidade.
 */
function useTeacherSales(id) {
  const [selectedMonth, setSelectedMonth] = useState(dayjs());
  const [teacher, setTeacher] = useState(null);
  const [groups, setGroups] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const lastLoadKeyRef = useRef(null);
  const loadControllerRef = useRef(null);

  const fetchData = useCallback(
    async (signal) => {
      setLoading(true);
      try {
        const { data: teacherData } = await apiSunset.get(`/teachers/${id}`, { signal });
        setTeacher(teacherData);

        const { data } = await apiSunset.get('/teacher-sales', {
          signal,
          params: {
            dataInicio: dayjs(selectedMonth).startOf('month').format('YYYY-MM-DD'),
            dataFinal: dayjs(selectedMonth).endOf('month').format('YYYY-MM-DD'),
            codigoProfessor: String(id),
          },
        });

        setTotal(somarValorTotal(data));
        setGroups(agruparVendasPorCliente(data));
      } finally {
        // Não mexe no loading se esta busca foi cancelada por uma mais recente.
        if (!signal?.aborted) setLoading(false);
      }
    },
    [id, selectedMonth],
  );

  useEffect(() => {
    if (!id) return;

    const monthKey = selectedMonth ? dayjs(selectedMonth).format('YYYY-MM') : 'all';
    const loadKey = `${id}|${monthKey}`;

    // Mesma busca já disparada (StrictMode remonta o componente): ignora.
    if (lastLoadKeyRef.current === loadKey) return;
    lastLoadKeyRef.current = loadKey;

    // Troca real de mês/professor: cancela a busca anterior ainda em andamento.
    loadControllerRef.current?.abort();
    const controller = new AbortController();
    loadControllerRef.current = controller;

    fetchData(controller.signal).catch((err) => {
      // Busca cancelada por troca de mês/professor: sem estado parcial.
      if (controller.signal.aborted) return;
      // Libera a chave para permitir nova tentativa após erro.
      if (lastLoadKeyRef.current === loadKey) lastLoadKeyRef.current = null;
      console.error(
        'Erro ao carregar dados do professor: ' + (err?.message || 'Erro desconhecido'),
      );
    });
  }, [id, selectedMonth, fetchData]);

  const refetch = useCallback(async () => {
    try {
      await fetchData();
    } catch (err) {
      console.error(
        'Erro ao carregar dados do professor: ' + (err?.message || 'Erro desconhecido'),
      );
    }
  }, [fetchData]);

  return { selectedMonth, setSelectedMonth, teacher, groups, total, loading, refetch };
}

export default useTeacherSales;
