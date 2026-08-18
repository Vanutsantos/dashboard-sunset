import { DatePicker, Table, Tag, Typography } from 'antd';
import { useParams } from 'react-router-dom';
import useTeachers from '../../hooks/useTeachers';
import { useSync } from '../../contexts/SyncContext';
import { useEffect, useMemo, useRef, useState } from 'react';
import api from '../../services/api';
import dayjs from 'dayjs';

const { Title } = Typography;
const PAGE_SIZE = 30;

function getDateRange(date) {
  const now = dayjs();
  const selected = dayjs(date);
  const start = selected.startOf('month').format('YYYY-MM-DD');

  const isCurrentMonth = selected.year() === now.year() && selected.month() === now.month();
  const end = isCurrentMonth
    ? now.format('YYYY-MM-DD')
    : selected.endOf('month').format('YYYY-MM-DD');

  return { start, end };
}

const clientColumns = [
  { title: 'ID', dataIndex: 'clientId', key: 'clientId', width: 100 },
  { title: 'Nome', dataIndex: 'nome', key: 'nome' },
  {
    title: 'Qtd. Vendas',
    dataIndex: 'totalVendas',
    key: 'totalVendas',
    width: 120,
    align: 'center',
  },
];

const salesColumns = [
  { title: 'ID Venda', dataIndex: 'id', key: 'id', width: 100 },
  { title: 'Descrição', dataIndex: 'descricao', key: 'descricao' },
  {
    title: 'Valor',
    dataIndex: 'valorTotal',
    key: 'valorTotal',
    width: 120,
    render: (val) => (val != null ? `R$ ${val.toFixed(2)}` : '-'),
  },
  {
    title: 'Data',
    dataIndex: 'data',
    key: 'data',
    width: 120,
    render: (val) => (val ? dayjs(val).format('DD/MM/YYYY') : '-'),
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    width: 120,
    render: (status) => {
      const colors = { Concluida: 'green', Pendente: 'orange', Cancelada: 'red' };
      return <Tag color={colors[status] || 'default'}>{status || '-'}</Tag>;
    },
  },
];

function TeacherSales() {
  const { id } = useParams();
  const { data: teachers } = useTeachers();
  const { allClients } = useSync();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(dayjs());
  const isFetchingRef = useRef(false);

  const teacher = teachers.find((t) => String(t.id) === id);

  const teacherClients = useMemo(
    () => allClients?.filter((c) => c.codigoUsuarioConsultor == id),
    [allClients, id],
  );

  useEffect(() => {
    const fetchSales = async () => {
      if (isFetchingRef.current || !teacherClients.length) return;
      isFetchingRef.current = true;
      setLoading(true);
      try {
        const { start, end } = getDateRange(selectedMonth);
        const salesItems = [];

        for (const client of teacherClients) {
          let skip = 0;
          let hasNext = true;

          while (hasNext) {
            const response = await api.get('/Venda', {
              params: {
                Skip: skip,
                Take: PAGE_SIZE,
                DataInicio: start,
                DataFim: end,
                CodigoCliente: client.id,
              },
            });

            const items = response?.data?.items ?? [];
            const clientItems = items.map((i) => ({
              ...i,
              clientId: client.id,
              clientNome: client.nome,
            }));
            salesItems.push(...clientItems);

            hasNext = response?.data?.temProximaPagina ?? false;
            skip += PAGE_SIZE;
          }
        }

        setSales(salesItems);
      } catch (err) {
        console.error('Erro ao buscar vendas: ' + (err.message || 'Erro desconhecido'));
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    };

    fetchSales();
  }, [teacherClients, selectedMonth]);

  // Agrupa vendas por cliente
  const groupedByClient = useMemo(() => {
    const map = {};
    sales.forEach((sale) => {
      if (!map[sale.clientId]) {
        map[sale.clientId] = {
          clientId: sale.clientId,
          nome: sale.clientNome,
          vendas: [],
        };
      }
      map[sale.clientId].vendas.push(sale);
    });

    return Object.values(map).map((group) => ({
      ...group,
      key: group.clientId,
      totalVendas: group.vendas.length,
    }));
  }, [sales]);

  const handleMonthChange = (date) => {
    if (date) {
      isFetchingRef.current = false;
      setSales([]);
      setSelectedMonth(date);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={4} style={{ margin: 0 }}>
          Vendas - {teacher?.nome || 'Professor'}
        </Title>
        <DatePicker
          picker="month"
          value={selectedMonth}
          onChange={handleMonthChange}
          format="MMMM/YYYY"
          allowClear={false}
        />
      </div>
      <Table
        dataSource={groupedByClient}
        columns={clientColumns}
        rowKey="clientId"
        loading={loading}
        pagination={false}
        style={{ marginTop: 16 }}
        expandable={{
          expandedRowRender: (record) => (
            <Table
              dataSource={record.vendas}
              columns={salesColumns}
              rowKey="id"
              pagination={false}
              size="small"
            />
          ),
        }}
      />
    </div>
  );
}

export default TeacherSales;
