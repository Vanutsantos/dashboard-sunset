import { useState, useEffect, useCallback } from 'react';
import { Typography, Table, Tag, Button, Space, DatePicker } from 'antd';
import dayjs from 'dayjs';
import api from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/format';
import { statusColor } from '../../utils/sales';

const { Title } = Typography;

const PAGE_SIZE = 20;

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
  { title: 'Descrição', dataIndex: 'descricao', key: 'descricao' },
  {
    title: 'Valor',
    dataIndex: 'valorTotal',
    key: 'valorTotal',
    width: 120,
    render: (val) => formatCurrency(val),
  },
  {
    title: 'Data',
    dataIndex: 'data',
    key: 'data',
    width: 120,
    render: (val) => formatDate(val),
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    width: 120,
    render: (status) => <Tag color={statusColor(status)}>{status || '-'}</Tag>,
  },
];

function Sales() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(dayjs());

  const fetchSales = useCallback(
    async (skip) => {
      setLoading(true);
      try {
        const now = dayjs();
        const start = selectedMonth.startOf('month').format('YYYY-MM-DD');
        const isCurrentMonth =
          selectedMonth.year() === now.year() && selectedMonth.month() === now.month();
        const end = isCurrentMonth
          ? now.format('YYYY-MM-DD')
          : selectedMonth.endOf('month').format('YYYY-MM-DD');

        const response = await api.get('/Venda', {
          params: { Skip: skip, Take: PAGE_SIZE, DataInicio: start, DataFim: end },
        });

        setData(response.data?.items ?? []);
        setHasNext(response.data?.temProximaPagina ?? false);
      } catch (err) {
        console.error('Erro ao buscar vendas:', err.message);
      } finally {
        setLoading(false);
      }
    },
    [selectedMonth],
  );

  useEffect(() => {
    fetchSales(page * PAGE_SIZE);
  }, [page, fetchSales]);

  const handleMonthChange = (date) => {
    if (date) {
      setSelectedMonth(date);
      setPage(0);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={4} style={{ margin: 0 }}>
          Vendas
        </Title>
        <DatePicker
          picker="month"
          value={selectedMonth}
          onChange={handleMonthChange}
          format="MMMM/YYYY"
          allowClear={false}
          style={{ width: 150 }}
        />
      </div>
      <Table
        dataSource={data}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={false}
        style={{ marginTop: 16 }}
      />
      <Space style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between' }}>
        <span>Página {page + 1}</span>
        <Space>
          <Button disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            Anterior
          </Button>
          <Button disabled={!hasNext} onClick={() => setPage((p) => p + 1)}>
            Próxima
          </Button>
        </Space>
      </Space>
    </div>
  );
}

export default Sales;
