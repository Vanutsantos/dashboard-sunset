import { useCallback, useState } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { db } from '../services/firebase';

const COLLECTION = 'manualSales';

/**
 * Hook para criar e buscar vendas manuais no Firestore (coleção `manualSales`).
 * Cada venda é relacionada a um professor via teacherId.
 */
function useManualSales() {
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  /**
   * Cria uma venda manual.
   * @param {{ teacherId: string, nomeAluno: string, descricao: string, data: string, valor: number }} sale
   */
  const createSale = useCallback(async ({ teacherId, nomeAluno, descricao, data, valor }) => {
    setSaving(true);
    try {
      await addDoc(collection(db, COLLECTION), {
        teacherId: teacherId != null ? String(teacherId) : null,
        nomeAluno: nomeAluno ?? null,
        descricao: descricao ?? null,
        data: data ?? null,
        valor: valor ?? null,
        createdAt: serverTimestamp(),
      });
    } finally {
      setSaving(false);
    }
  }, []);

  /**
   * Busca todas as vendas manuais de um professor.
   * @param {string} teacherId
   * @returns {Promise<Array>} lista de vendas (com id do documento)
   */
  const getSalesByTeacher = useCallback(async (teacherId) => {
    if (teacherId == null) return [];
    const q = query(collection(db, COLLECTION), where('teacherId', '==', String(teacherId)));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
  }, []);

  /**
   * Exclui uma venda manual pelo id do documento.
   * @param {string} saleId
   */
  const deleteSale = useCallback(async (saleId) => {
    setDeleting(true);
    try {
      await deleteDoc(doc(db, COLLECTION, String(saleId)));
    } finally {
      setDeleting(false);
    }
  }, []);

  return { saving, deleting, createSale, getSalesByTeacher, deleteSale };
}

export default useManualSales;
