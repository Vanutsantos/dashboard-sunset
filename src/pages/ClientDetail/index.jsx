import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Typography,
  Descriptions,
  Table,
  Tag,
  Button,
  Card,
  Statistic,
  Row,
  Col,
  Result,
  Spin,
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useSync } from '../../contexts/SyncContext';
import useTeachers from '../../hooks/useTeachers';
import api from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/format';
import { statusColor, sumSalesTotal } from '../../utils/sales';
import { PATHS } from '../../routes/paths';

const { Title } = Typography;
const PAGE_SIZE = 30;

const salesColumns = [
  { title: 'ID Venda', dataIndex: 'id', key: 'id', width: 100 },
  { title: 'Descrição', dataIndex: 'descricao', key: 'descricao' },
  {
    title: 'Valor',
    dataIndex: 'valorTotal',
    key: 'valorTotal',
    width: 140,
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

function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { allClients } = useSync();
  const { data: teachers } = useTeachers();
  const [sales, setSales] = useState([]);
  const [loadingSales, setLoadingSales] = useState(false);

  const client = useMemo(
    () => allClients?.find((c) => String(c.id) === String(id)),
    [allClients, id],
  );

  const teacherName = useMemo(() => {
    if (!client) return '-';
    const teacher = teachers.find((t) => String(t.id) === String(client.codigoUsuarioConsultor));
    return teacher?.nome ?? '-';
  }, [client, teachers]);

  useEffect(() => {
    if (!client) return;
    let active = true;
    (async () => {
      setLoadingSales(true);
      try {
        const items = [];
        let skip = 0;
        let hasNext = true;
        while (hasNext) {
          const response = await api.get('/Venda', {
            params: { Skip: skip, Take: PAGE_SIZE, CodigoCliente: client.id },
          });
          items.push(...(response.data?.items ?? []));
          hasNext = response.data?.temProximaPagina ?? false;
          skip += PAGE_SIZE;
        }
        if (active) setSales(items);
      } catch (err) {
        console.error('Erro ao buscar vendas do cliente:', err.message);
        if (active) setSales([]);
      } finally {
        if (active) setLoadingSales(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [client]);

  if (!allClients?.length) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
        <Spin tip="Carregando clientes..." />
      </div>
    );
  }

  if (!client) {
    return (
      <Result
        status="404"
        title="Cliente não encontrado"
        subTitle="Não localizamos um cliente com este identificador."
        extra={
          <Button type="primary" onClick={() => navigate(PATHS.clients)}>
            Voltar para Clientes
          </Button>
        }
      />
    );
  }

  const totalSales = sumSalesTotal(sales);

  return (
    <div>
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(PATHS.clients)}
        style={{ paddingLeft: 0 }}
      >
        Voltar para Clientes
      </Button>

      <Title level={4} style={{ marginTop: 8 }}>
        {(client.nome || '')?.toUpperCase()}
      </Title>

      <Descriptions bordered column={{ xs: 1, sm: 2 }} size="small" style={{ marginTop: 8 }}>
        <Descriptions.Item label="ID">{client.codigoCliente ?? client.id}</Descriptions.Item>
        <Descriptions.Item label="E-mail">{client.email ?? '-'}</Descriptions.Item>
        <Descriptions.Item label="Professor">{teacherName}</Descriptions.Item>
        <Descriptions.Item label="Sexo">{client.sexo ?? '-'}</Descriptions.Item>
        <Descriptions.Item label="Status">{client.status ?? '-'}</Descriptions.Item>
      </Descriptions>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col xs={12}>
          <Card>
            <Statistic title="Total de vendas" value={sales.length} loading={loadingSales} />
          </Card>
        </Col>
        <Col xs={12}>
          <Card>
            <Statistic
              title="Valor acumulado"
              value={formatCurrency(totalSales)}
              loading={loadingSales}
            />
          </Card>
        </Col>
      </Row>

      <Title level={5} style={{ marginTop: 24 }}>
        Histórico de vendas
      </Title>
      <Table
        dataSource={sales}
        columns={salesColumns}
        rowKey="id"
        loading={loadingSales}
        pagination={{ pageSize: 10, hideOnSinglePage: true }}
        size="small"
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
}

export default ClientDetail;
