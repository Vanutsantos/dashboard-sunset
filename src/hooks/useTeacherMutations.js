import { useCallback, useState } from 'react';
import { deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

const COLLECTION = 'teachers';

/**
 * Hook com as operações de escrita de professores no Firestore.
 * Fornece create/update/delete e um helper para buscar um professor por id.
 */
function useTeacherMutations() {
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const getTeacher = useCallback(async (id) => {
    const snapshot = await getDoc(doc(db, COLLECTION, String(id)));
    return snapshot.exists() ? snapshot.data() : null;
  }, []);

  const teacherExists = useCallback(async (id) => {
    const snapshot = await getDoc(doc(db, COLLECTION, String(id)));
    return snapshot.exists();
  }, []);

  const saveTeacher = useCallback(async ({ id, nome, tipoAula, porcentagem }) => {
    setSaving(true);
    try {
      const data = {
        id: String(id),
        nome,
        porcentagem: porcentagem ?? null,
      };
      // Só grava tipoAula quando informado, para não apagar o valor existente
      // quando o campo não faz parte do fluxo que está salvando.
      if (tipoAula !== undefined) {
        data.tipoAula = tipoAula ?? null;
      }
      // merge evita remover campos do documento que não foram enviados aqui.
      await setDoc(doc(db, COLLECTION, String(id)), data, { merge: true });
    } finally {
      setSaving(false);
    }
  }, []);

  const deleteTeacher = useCallback(async (id) => {
    setDeleting(true);
    try {
      await deleteDoc(doc(db, COLLECTION, String(id)));
    } finally {
      setDeleting(false);
    }
  }, []);

  return { saving, deleting, getTeacher, teacherExists, saveTeacher, deleteTeacher };
}

export default useTeacherMutations;
