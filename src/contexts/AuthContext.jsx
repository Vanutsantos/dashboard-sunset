import { createContext, useContext, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Spin } from 'antd';
import Cookies from 'js-cookie';
import '../services/firebase'; // garante inicialização
import { db } from '../services/firebase';

const AuthContext = createContext(null);

const auth = getAuth();

/**
 * Busca, na coleção `teachers`, um professor cujo e-mail corresponda ao
 * e-mail informado. Retorna o professor (com id do documento) ou null.
 */
async function findTeacherByEmail(email) {
  if (!email) return null;
  const q = query(collection(db, 'teachers'), where('email', '==', email));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const docSnap = snapshot.docs[0];
  return { id: docSnap.id, ...docSnap.data() };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // Professor vinculado ao usuário logado (null = admin / não é professor).
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  // Indica que o papel do usuário (professor x admin) já foi determinado.
  // Enquanto false, a UI não deve assumir que o usuário é admin.
  const [roleResolved, setRoleResolved] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // Ao mudar o usuário, o papel volta a ser "não resolvido".
      setRoleResolved(false);
      setUser(firebaseUser);
      // Identifica se o usuário logado é um professor (por e-mail).
      if (firebaseUser?.email) {
        try {
          const matched = await findTeacherByEmail(firebaseUser.email);
          setTeacher(matched);
        } catch {
          setTeacher(null);
        }
      } else {
        setTeacher(null);
      }
      setRoleResolved(true);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const logout = async () => {
    localStorage.clear();
    Object.keys(Cookies.get()).forEach((name) => Cookies.remove(name));
    await signOut(auth);
  };

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{ user, teacher, isTeacher: !!teacher, roleResolved, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
