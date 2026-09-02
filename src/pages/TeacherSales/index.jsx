import {
  Button,
  Card,
  Col,
  DatePicker,
  InputNumber,
  Row,
  Space,
  Statistic,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from 'antd';
import { useParams } from 'react-router-dom';
import useTeachers from '../../hooks/useTeachers';
import useTeacherMutations from '../../hooks/useTeacherMutations';
import { useSync } from '../../contexts/SyncContext';
import { useEffect, useMemo, useState } from 'react';
import { EditOutlined, SaveOutlined } from '@ant-design/icons';
import api from '../../services/api';
import dayjs from 'dayjs';

const { Title } = Typography;
const PAGE_SIZE = 30;

function getDateRange(date) {
  const selected = dayjs(date);
  // Sempre do primeiro ao último dia do mês, inclusive quando for o mês atual.
  const start = selected.startOf('month').format('YYYY-MM-DD');
  const end = selected.endOf('month').format('YYYY-MM-DD');

  return { start, end };
}

/**
 * Calcula o valor de repasse a partir de um total e uma porcentagem.
 * Retorna null quando a porcentagem não está definida.
 */
function calcRepasse(total, percent) {
  if (percent == null || total == null) return null;
  return (total * percent) / 100;
}

// Termos de periodicidade na descrição da venda e o nº de meses correspondente.
const PERIOD_DIVISORS = [
  { regex: /trimestral|trimestre/i, months: 3 },
  { regex: /semestral|semestre/i, months: 6 },
  { regex: /anual|ano/i, months: 12 },
  { regex: /bimestral|bimestre/i, months: 2 },
];

/**
 * Retorna o divisor (nº de meses) com base na descrição da venda.
 * Vendas trimestrais/semestrais/anuais etc. têm o valor rateado por mês.
 * Retorna 1 quando não há termo de periodicidade reconhecido.
 */
function getPeriodDivisor(descricao) {
  const desc = descricao || '';
  const match = PERIOD_DIVISORS.find((p) => p.regex.test(desc));
  return match ? match.months : 1;
}

const salesColumns = [
  {
    title: '#',
    key: 'index',
    width: 60,
    align: 'center',
    render: (_, __, index) => index + 1,
  },
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
  const { data: teachers, refetch: refetchTeachers } = useTeachers();
  const { saving, saveTeacher } = useTeacherMutations();
  const { allClients } = useSync();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(dayjs());

  const teacher = teachers.find((t) => String(t.id) === id);

  // Edição inline da porcentagem de repasse do professor.
  const [editingPercent, setEditingPercent] = useState(false);
  const [percentValue, setPercentValue] = useState(teacher?.porcentagem ?? null);
  // Rastreia o professor renderizado para reiniciar o estado ao trocar/carregar,
  // sem usar efeito (padrão de ajuste de estado durante o render do React).
  const [syncedTeacher, setSyncedTeacher] = useState(teacher);
  if (syncedTeacher !== teacher) {
    setSyncedTeacher(teacher);
    setPercentValue(teacher?.porcentagem ?? null);
    setEditingPercent(false);
  }

  const handleSavePercent = async () => {
    if (!teacher) return;
    try {
      await saveTeacher({
        id: teacher.id,
        nome: teacher.nome,
        tipoAula: teacher.tipoAula,
        porcentagem: percentValue,
      });
      message.success('Porcentagem atualizada com sucesso!');
      setEditingPercent(false);
      refetchTeachers();
    } catch (err) {
      message.error('Erro ao salvar porcentagem: ' + (err.message || 'Erro desconhecido'));
    }
  };

  const teacherClients = useMemo(
    () => (allClients || []).filter((c) => String(c.codigoUsuarioConsultor) === String(id)),
    [allClients, id],
  );


  // Chave estável dos clientes do professor: evita re-buscar quando o
  // allClients muda de referência mas o subconjunto do professor é o mesmo.
  const teacherClientsKey = useMemo(
    () => teacherClients.map((c) => c.codigoCliente).join(','),
    [teacherClients],
  );

  useEffect(() => {
    let active = true;

    const fetchSales = async () => {
      // Sem clientes, não há o que buscar: zera as vendas e encerra.
      if (!teacherClients.length) {
        setSales([]);
        return;
      }
      setLoading(true);
      try {
        const { start, end } = getDateRange(selectedMonth);
        const salesItems = [];

        // Busca (paginada) as vendas de um cliente em um intervalo de datas.
        const fetchClientSales = async (client, dataInicio, dataFim) => {
          const result = [];
          let skip = 0;
          let hasNext = true;

          while (hasNext) {
            const response = await api.get('/Venda', {
              params: {
                Status: 'Concluida',
                Skip: skip,
                Take: PAGE_SIZE,
                DataInicio: dataInicio,
                DataFim: dataFim,
                CodigoCliente: client.codigoCliente,
              },
            });

            const items = response?.data?.items ?? [];
            result.push(
              ...items.map((i) => ({
                ...i,
                clientId: client.codigoCliente,
                clientNome: client.nome,
              })),
            );

            hasNext = response?.data?.temProximaPagina ?? false;
            skip += PAGE_SIZE;
          }

          return result;
        };

        for (const client of teacherClients) {
          let clientSales = await fetchClientSales(client, start, end);

          // Se não houve venda no mês selecionado e o contrato é de mais de um
          // mês (tipoDuracao 'Mes' e tempoDuracao > 1), refaz a busca a partir
          // da data de início do contrato até um mês depois dela.
          if (
            clientSales.length === 0 &&
            client.tipoDuracao === 'Mes' &&
            client.tempoDuracao > 1 &&
            client.dataInicio
          ) {
            const inicio = dayjs(client.dataInicio);
            if (inicio.isValid()) {
              clientSales = await fetchClientSales(
                client,
                inicio.format('YYYY-MM-DD'),
                inicio.add(1, 'month').format('YYYY-MM-DD'),
              );
            }
          }

          salesItems.push(...clientSales);
        }

        // Ignora o resultado se as dependências mudaram durante a busca.
        if (active) setSales(salesItems);
      } catch (err) {
        console.error('Erro ao buscar vendas: ' + (err.message || 'Erro desconhecido'));
        if (active) setSales([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchSales();

    return () => {
      active = false;
    };
    // teacherClientsKey representa a identidade estável de teacherClients.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacherClientsKey, selectedMonth]);

  // Agrupa vendas por cliente e inclui alunos sem vendas
  const groupedByClient = useMemo(() => {
    // const filteredSales = sales.filter((sale) => (sale.descricao || '').includes('SEMANA'));
    const filteredSales = sales.filter((sale) => !(sale.descricao || '').includes('SEMANsdsdsdsA'));

    const map = {};

    // Inicializa todos os alunos do professor (mesmo sem vendas)
    teacherClients.forEach((client) => {
      map[client.codigoCliente] = {
        clientId: client.codigoCliente,
        nome: client.nome,
        vendas: [],
      };
    });

    filteredSales.forEach((sale) => {
      // Se a descrição for "Wellhub - Beach Tennis" ou "Wellhub - Futevôlei", o valor é 20.90
      // Se a descrição for "TotalPass - Beach Tennis", o valor é 23.90
      const desc = (sale.descricao || '').trim();
      let adjustedSale = sale;
      if (desc === 'Wellhub - Beach Tennis') {
        adjustedSale = { ...sale, valorTotal: 23 };
      }else if (desc === 'Wellhub - Futevôlei') {
        adjustedSale = { ...sale, valorTotal: 18 };
      } else if (desc === 'TotalPass - Beach Tennis') {
        adjustedSale = { ...sale, valorTotal: 20.17 };
      }

      // Vendas com periodicidade na descrição (Trimestral, Semestral, Anual...)
      // têm o valor rateado pelo número de meses correspondente.
      const divisor = getPeriodDivisor(desc);
      if (divisor > 1 && adjustedSale.valorTotal != null) {
        adjustedSale = {
          ...adjustedSale,
          valorTotal: adjustedSale.valorTotal / divisor,
        };
      }

      if (!map[adjustedSale.clientId]) {
        map[adjustedSale.clientId] = {
          clientId: adjustedSale.clientId,
          nome: adjustedSale.clientNome,
          vendas: [],
        };
      }
      map[adjustedSale.clientId].vendas.push(adjustedSale);
    });

    return Object.values(map)
      .map((group) => {
        const totalValor = group.vendas.reduce((sum, v) => sum + (v.valorTotal || 0), 0);
        return {
          ...group,
          key: group.clientId,
          totalVendas: group.vendas.length,
          totalValor,
        };
      })
      .sort((a, b) => (a.nome || '').localeCompare(b.nome || ''));
  }, [sales, teacherClients]);

  const handleMonthChange = (date) => {
    if (date) {
      setSelectedMonth(date);
    }
  };

  const totalAlunos = groupedByClient.length;
  const totalGeral = groupedByClient.reduce((sum, g) => sum + (g.totalValor || 0), 0);
  const totalRepasse = calcRepasse(totalGeral, percentValue);

  // Colunas da tabela de alunos. Incluem o repasse calculado com a
  // porcentagem atual do professor (recalcula ao editar a porcentagem).
  const clientColumns = useMemo(
    () => [
      {
        title: '#',
        key: 'index',
        width: 60,
        align: 'center',
        render: (_, __, index) => index + 1,
      },
      { title: 'ID', dataIndex: 'clientId', key: 'clientId', width: 100 },
      { title: 'Nome', dataIndex: 'nome', key: 'nome' },
      {
        title: 'Qtd. Vendas',
        dataIndex: 'totalVendas',
        key: 'totalVendas',
        width: 120,
        align: 'center',
      },
      {
        title: 'Total (R$)',
        dataIndex: 'totalValor',
        key: 'totalValor',
        width: 130,
        align: 'right',
        render: (val) => (val != null ? `R$ ${val.toFixed(2)}` : '-'),
      },
    ],
    [percentValue],
  );

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <Title level={4} style={{ margin: 0 }}>
          {teacher?.nome || 'Professor'}
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

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic title="Alunos" value={totalAlunos} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic title="Total em vendas" value={totalGeral} precision={2} prefix="R$" />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Repasse"
              value={totalRepasse != null ? totalRepasse : 0}
              precision={2}
              prefix="R$"
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 14, marginBottom: 4 }}>
              Repasse (%)
            </div>
            <Space align="center" size="small">
              <InputNumber
                value={percentValue}
                onChange={setPercentValue}
                disabled={!editingPercent || !teacher}
                min={0}
                max={100}
                precision={0}
                suffix="%"
                placeholder="—"
                style={{ width: 100 }}
                parser={(value) => {
                  const digits = (value || '').replace(/\D/g, '');
                  if (digits === '') return '';
                  return Math.min(100, Number(digits));
                }}
              />
              {editingPercent ? (
                <Tooltip title="Salvar">
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    loading={saving}
                    onClick={handleSavePercent}
                  />
                </Tooltip>
              ) : (
                <Tooltip title="Editar porcentagem">
                  <Button
                    icon={<EditOutlined />}
                    disabled={!teacher}
                    onClick={() => setEditingPercent(true)}
                  />
                </Tooltip>
              )}
            </Space>
          </Card>
        </Col>
      </Row>

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
