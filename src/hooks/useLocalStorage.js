import { useCallback, useState } from 'react';

/**
 * Hook de estado persistido no localStorage.
 * Comporta-se como useState, mas sincroniza o valor com o localStorage
 * sob a chave informada. Suporta valor inicial ou função inicializadora,
 * como o useState nativo.
 *
 * @param {string} key - Chave do localStorage.
 * @param {*} initialValue - Valor inicial (ou função que o retorna).
 * @returns {[*, Function]} Par [valor, setValor].
 */
function useLocalStorage(key, initialValue) {
  const readValue = useCallback(() => {
    if (typeof window === 'undefined') {
      return typeof initialValue === 'function' ? initialValue() : initialValue;
    }
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) {
        return typeof initialValue === 'function' ? initialValue() : initialValue;
      }
      return JSON.parse(raw);
    } catch {
      return typeof initialValue === 'function' ? initialValue() : initialValue;
    }
  }, [key, initialValue]);

  const [storedValue, setStoredValue] = useState(readValue);

  const setValue = useCallback(
    (value) => {
      setStoredValue((prev) => {
        const next = typeof value === 'function' ? value(prev) : value;
        try {
          window.localStorage.setItem(key, JSON.stringify(next));
        } catch {
          // ignora falhas de escrita (ex.: modo privado / quota)
        }
        return next;
      });
    },
    [key],
  );

  return [storedValue, setValue];
}

export default useLocalStorage;
