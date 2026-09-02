import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Spin, message } from 'antd';
import { useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';
import api from '../services/api';

const SyncContext = createContext(null);

const SYNC_PAGE_SIZE = 30;
const COOKIE_NAME = 'allClients_synced';
const COOKIE_EXPIRY_MINUTES = 600;

function isCacheValid() {
  return !!Cookies.get(COOKIE_NAME);
}

function setCacheValid() {
  const expiresAt = new Date(Date.now() + COOKIE_EXPIRY_MINUTES * 60 * 1000);
  Cookies.set(COOKIE_NAME, 'true', { expires: expiresAt });
}

function invalidateCache() {
  Cookies.remove(COOKIE_NAME);
}

function getCachedClients() {
  if (!isCacheValid()) {
    localStorage.removeItem('allClients');
    return null;
  }
  try {
    const raw = localStorage.getItem('allClients');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setCachedClients(data) {
  localStorage.setItem('allClients', JSON.stringify(data));
  setCacheValid();
}

export function SyncProvider({ children }) {
  const [syncing, setSyncing] = useState(false);
  const isSyncingRef = useRef(false);
  const [allClients, setAllClients] = useState(getCachedClients() || []);
  const location = useLocation();

  const fetchAllContracts = async () => {
    let contracts = [];
    let skip = 0;
    let hasNext = true;

    while (hasNext) {
      const response = await api.get('/ContratoCliente', {
        params: { Skip: skip, Take: SYNC_PAGE_SIZE, Status: 'Ativo' },
      });
      const items = response.data?.items ?? [];
      contracts = [...contracts, ...items];
      hasNext = response.data?.temProximaPagina ?? false;
      skip += SYNC_PAGE_SIZE;
    }

    // Filtra contratos com IDs únicos
    contracts = contracts.filter(
      (contract, index, self) =>
        self.findIndex((c) => c.codigoCliente === contract.codigoCliente) === index,
    );

    return contracts;
  };

  const fetchAllClientsPessoa = async () => {
    let clients = [];
    let skip = 0;
    let hasNext = true;

    while (hasNext) {
      const response = await api.get('/Pessoa/GetClientes', {
        params: { Skip: skip, Take: SYNC_PAGE_SIZE, Inativo: false },
      });
      const items = response.data?.items ?? [];
      clients = [...clients, ...items];
      hasNext = response.data?.temProximaPagina ?? false;
      skip += SYNC_PAGE_SIZE;
    }

    return clients;
  };

  const fetchAllClients = async () => {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    setSyncing(true);
    try {
      // 1. Busca todos os contratos ativos
      const contracts = await fetchAllContracts();
      console.log(contracts);

      // 2. Busca todos os clientes não inativos
      const clients = await fetchAllClientsPessoa();

      // 3. Mapeia os contratos buscando os dados do cliente pelo codigoCliente
      const clientsMap = clients.reduce((map, client) => {
        map[client.id] = client;
        return map;
      }, {});

      const mergedClients = contracts.map((contract) => ({
        ...contract,
        ...clientsMap[contract.codigoCliente],
      }));

      // Remove duplicatas por codigoCliente (mantém apenas o primeiro)
      const uniqueClients = mergedClients.filter(
        (item, index, self) =>
          self.findIndex((c) => c.codigoCliente === item.codigoCliente) === index,
      );

      uniqueClients.sort((a, b) => (a.nome || '').localeCompare(b.nome || ''));

      setCachedClients(uniqueClients);
      setAllClients(uniqueClients);
      message.success(`${uniqueClients.length} clientes sincronizados com sucesso!`);
    } catch (err) {
      message.error('Erro ao sincronizar: ' + (err.message || 'Erro desconhecido'));
    } finally {
      setSyncing(false);
      isSyncingRef.current = false;
    }
  };

  // Verifica cache na montagem e a cada troca de página
  useEffect(() => {
    if (isCacheValid()) return;
    fetchAllClients();
  }, [location.pathname]);

  // Força sincronização ignorando cache
  const syncClients = async () => {
    invalidateCache();
    isSyncingRef.current = false;
    await fetchAllClients();
  };

  return (
    <SyncContext.Provider value={{ syncing, allClients, syncClients }}>
      {syncing && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255, 255, 255, 0.7)',
          }}
        >
          <Spin size="large" tip="Sincronizando dados..." />
        </div>
      )}
      {children}
    </SyncContext.Provider>
  );
}

export function useSync() {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSync deve ser usado dentro de um SyncProvider');
  }
  return context;
}
