import { Typography, Table, Tag } from 'antd';
import { useSales } from '../../hooks';

const { Title } = Typography;

const mockSales = [
  {
    id: 1,
    cliente: 'Maria Oliveira',
    plano: 'Mensal',
    valor: 'R$ 150,00',
    data: '2026-08-01',
    status: 'Pago',
  },
  {
    id: 2,
    cliente: 'Carlos Santos',
    plano: 'Trimestral',
    valor: 'R$ 400,00',
    data: '2026-08-03',
    status: 'Pago',
  },
  {
    id: 3,
    cliente: 'Ana Souza',
    plano: 'Mensal',
    valor: 'R$ 150,00',
    data: '2026-08-05',
    status: 'Pendente',
  },
  {
    id: 4,
    cliente: 'Pedro Lima',
    plano: 'Anual',
    valor: 'R$ 1.200,00',
    data: '2026-08-07',
    status: 'Pago',
  },
  {
    id: 5,
    cliente: 'Juliana Costa',
    plano: 'Mensal',
    valor: 'R$ 150,00',
    data: '2026-08-10',
    status: 'Pendente',
  },
];

const columns = [
  { title: 'Cliente', dataIndex: 'cliente', key: 'cliente' },
  { title: 'Plano', dataIndex: 'plano', key: 'plano' },
  { title: 'Valor', dataIndex: 'valor', key: 'valor' },
  { title: 'Data', dataIndex: 'data', key: 'data' },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (status) => <Tag color={status === 'Pago' ? 'green' : 'orange'}>{status}</Tag>,
  },
];

function Sales() {
  const { data, loading, error, refetch } = useSales({
    params: { CodigoCliente: 25864775, DataInicio: '2026-08-01', DataFim: '2026-08-17' },
  });

  console.log('data', data);

  return (
    <div>
      <Title level={4}>Vendas</Title>
      <Table dataSource={mockSales} columns={columns} rowKey="id" />
    </div>
  );
}

export default Sales;
