import { useState, useMemo } from 'react';
import { Typography, Table, Tag, Input, Button, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useSync } from '../../contexts/SyncContext';
import useTeachers from '../../hooks/useTeachers';

const { Title } = Typography;

const PAGE_SIZE = 20;

function Clients() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const { syncing, allClients } = useSync();
  const { data: teachers } = useTeachers();

  // Mapa de id → nome do professor para lookup rápido
  const teacherMap = useMemo(() => {
    const map = {};
    teachers.forEach((t) => {
      map[t.id] = t.nome;
    });
    return map;
  }, [teachers]);

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Nome', dataIndex: 'nome', key: 'nome', render: (nome) => nome.toUpperCase() },
    { title: 'E-mail', dataIndex: 'email', key: 'email' },
    {
      title: 'Professor',
      dataIndex: 'codigoUsuarioConsultor',
      key: 'codigoUsuarioConsultor',
      render: (id) => teacherMap[id] ?? '-',
    },
    { title: 'Sexo', dataIndex: 'sexo', key: 'sexo', render: (sexo) => sexo ?? '-' },
    {
      title: 'Status',
      dataIndex: 'inativo',
      key: 'inativo',
      render: (inativo) => (
        <Tag color={!inativo ? 'green' : 'red'}>{inativo ? 'Inativo' : 'Ativo'}</Tag>
      ),
    },
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

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={4} style={{ margin: 0 }}>
          Clientes
        </Title>
        <Input.Search
          placeholder="Buscar por nome ou ID"
          allowClear
          prefix={<SearchOutlined />}
          onSearch={handleSearch}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ width: 300 }}
        />
      </div>
      <Table
        dataSource={paginatedData}
        columns={columns}
        rowKey="id"
        loading={syncing}
        pagination={false}
        style={{ marginTop: 16 }}
      />
      <Space style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between' }}>
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
      </Space>
    </div>
  );
}

export default Clients;
