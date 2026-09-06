import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

const COLLECTION = 'loginLogs';

/**
 * Tenta obter o IP público do usuário via serviço externo (best-effort).
 * Retorna null se falhar (rede/bloqueio), sem lançar erro.
 */
async function fetchPublicIp() {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    if (!res.ok) return null;
    const data = await res.json();
    return data?.ip ?? null;
  } catch {
    return null;
  }
}

/**
 * Registra um login bem-sucedido no Firestore (coleção `loginLogs`).
 * Guarda data (timestamp do servidor), IP (quando disponível) e metadados.
 * É best-effort: nunca lança — falhas apenas são logadas no console, para
 * não impedir o fluxo de login.
 *
 * @param {import('firebase/auth').User} user
 */
export async function recordLogin(user) {
  try {
    const ip = await fetchPublicIp();
    await addDoc(collection(db, COLLECTION), {
      uid: user?.uid ?? null,
      email: user?.email ?? null,
      ip,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      data: serverTimestamp(),
    });
  } catch (err) {
    // Não interrompe o login se o registro falhar.
    console.error('Falha ao registrar login:', err?.message || err);
  }
}
