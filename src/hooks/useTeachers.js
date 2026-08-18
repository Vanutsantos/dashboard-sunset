import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';

/**
 * Hook para buscar professores cadastrados no Firebase.
 * @returns {{ data: Array, loading: boolean, error: string|null, refetch: Function }}
 */
function useTeachers() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const snapshot = await getDocs(collection(db, 'teachers'));
      const teachers = snapshot.docs.map((doc) => doc.data());
      teachers.sort((a, b) => (a.nome || '').localeCompare(b.nome || ''));
      setData(teachers);
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
