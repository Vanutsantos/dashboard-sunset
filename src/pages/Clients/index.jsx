import { useState, useMemo, useCallback, useRef } from 'react';
import { Typography, Table, Input, Button, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useSync } from '../../contexts/SyncContext';
import useTeachers from '../../hooks/useTeachers';
import { clientDetailPath } from '../../routes/paths';

const { Title } = Typography;

const PAGE_SIZE = 20;

function Clients() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const { syncing, allClients } = useSync();
  const { data: teachers } = useTeachers();
  const navigate = useNavigate();

  // Mapa de id → nome do professor para lookup rápido
  const teacherMap = useMemo(() => {
    const map = {};
    teachers.forEach((t) => {
      map[t.id] = t.nome;
    });
    return map;
  }, [teachers]);

  const columns = [
    { title: 'ID', dataIndex: 'codigoCliente', key: 'codigoCliente' },
    { title: 'Nome', dataIndex: 'nome', key: 'nome', render: (nome) => nome?.toUpperCase() },
    { title: 'E-mail', dataIndex: 'email', key: 'email' },
    {
      title: 'Professor',
      dataIndex: 'codigoUsuarioConsultor',
      key: 'codigoUsuarioConsultor',
      render: (id) => teacherMap[id] ?? '-',
    },
    { title: 'Sexo', dataIndex: 'sexo', key: 'sexo', render: (sexo) => sexo ?? '-' },
  ];

  const filteredClients = useMemo(() => {
    if (!search.trim()) return allClients;
    const normalize = (str) =>
      (str || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
    const term = normalize(search);
    return allClients.filter(
      (c) => normalize(c.nome).includes(term) || String(c.id).includes(search.trim()),
    );
  }, [allClients, search]);

  const totalPages = Math.ceil(filteredClients.length / PAGE_SIZE);
  const paginatedData = filteredClients.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleSearch = (value) => {
    setSearch(value);
    setPage(0);
  };

  const debounceRef = useRef(null);

  const handleSearchDebounced = useCallback((value) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(value);
      setPage(0);
    }, 400);
  }, []);

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <Title level={4} style={{ margin: 0 }}>
          Clientes
        </Title>
        <Input.Search
          placeholder="Buscar por nome ou ID"
          allowClear
          prefix={<SearchOutlined />}
          onSearch={handleSearch}
          onChange={(e) => handleSearchDebounced(e.target.value)}
          style={{ width: '100%', maxWidth: 300 }}
        />
      </div>
      <Table
        dataSource={paginatedData}
        columns={columns}
        rowKey="id"
        loading={syncing}
        pagination={false}
        scroll={{ x: 'max-content' }}
        style={{ marginTop: 16 }}
        onRow={(record) => ({
          onClick: () => navigate(clientDetailPath(record.id)),
          style: { cursor: 'pointer' },
        })}
      />
      <div
        style={{
          marginTop: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <span>
          Página {page + 1} de {totalPages || 1} ({filteredClients.length} registros)
        </span>
        <Space>
          <Button disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            Anterior
          </Button>
          <Button disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
            Próxima
          </Button>
        </Space>
      </div>
    </div>
  );
}

export default Clients;
