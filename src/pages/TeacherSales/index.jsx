import {
  Button,
  Card,
  Col,
  DatePicker,
  InputNumber,
  Row,
  Segmented,
  Space,
  Statistic,
  Table,
  Tooltip,
  Typography,
  message,
  theme,
} from 'antd';
import { useParams } from 'react-router-dom';
import useTeachers from '../../hooks/useTeachers';
import useTeacherMutations from '../../hooks/useTeacherMutations';
import { useSync } from '../../contexts/SyncContext';
import { useEffect, useMemo, useState } from 'react';
import { EditOutlined, SaveOutlined } from '@ant-design/icons';
import api from '../../services/api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const PAGE_SIZE = 30;

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

// Vendas com estes termos na descrição são excluídas da listagem
// (aluguel/locação de quadra, day use, mensalista e variações).
const EXCLUDED_SALE_REGEX = /alug|loca[çc][ãa]o|day\s*use|mensalista/i;

/**
 * Indica se a venda deve ser removida da listagem com base na descrição.
 * A comparação ignora maiúsculas/minúsculas e acentos (locação/locacao).
 */
function isExcludedSale(descricao) {
  return EXCLUDED_SALE_REGEX.test(descricao || '');
}

const clientColumns = [
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
];

const salesColumns = [
  {
    title: '#',
    key: 'index',
    width: 60,
    align: 'center',
    render: (_, __, index) => index + 1,
  },
  { title: 'ID Venda', dataIndex: 'id', key: 'id', width: 120 },
  { title: 'Descrição', dataIndex: 'descricao', key: 'descricao' },
  {
    title: 'Parcela',
    dataIndex: 'parcela',
    key: 'parcela',
    width: 90,
    align: 'center',
    render: (val) => val || '-',
  },
  // {
  //   title: 'Competência',
  //   dataIndex: 'competencia',
  //   key: 'competencia',
  //   width: 120,
  //   align: 'center',
  //   render: (val, record) =>
  //     val || (record.data ? dayjs(record.data).format('MM/YYYY') : '-'),
  // },
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
  // {
  //   title: 'Status',
  //   dataIndex: 'status',
  //   key: 'status',
  //   width: 120,
  //   render: (status) => {
  //     const colors = { Concluida: 'green', Pendente: 'orange', Cancelada: 'red' };
  //     return <Tag color={colors[status] || 'default'}>{status || '-'}</Tag>;
  //   },
  // },
];

function TeacherSales() {
  const { id } = useParams();
  const { data: teachers, refetch: refetchTeachers } = useTeachers();
  const { saving, saveTeacher } = useTeacherMutations();
  const { allClients } = useSync();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  // Filtro de mês aplicado apenas no front (a busca traz todas as vendas).
  const [selectedMonth, setSelectedMonth] = useState(dayjs());
  // Filtro de exibição de alunos: por padrão só mostra os que têm venda.
  const [onlyWithSales, setOnlyWithSales] = useState(true);
  // Desconto (R$) aplicado ao repasse do mês. Apenas local, não é salvo.
  const [desconto, setDesconto] = useState(null);

  const teacher = teachers.find((t) => String(t.id) === id);
  const {
    token: { colorFillAlter },
  } = theme.useToken();

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
    // Cancela as requisições em andamento ao sair da página / trocar de professor.
    const controller = new AbortController();

    const fetchSales = async () => {
      // Sem clientes, não há o que buscar: zera as vendas e encerra.
      if (!teacherClients.length) {
        setSales([]);
        return;
      }
      setLoading(true);
      try {
        const salesItems = [];

        // Busca (paginada) TODAS as vendas concluídas de um cliente, sem filtro
        // de data.
        const fetchClientSales = async (client) => {
          const result = [];
          let skip = 0;
          let hasNext = true;

          while (hasNext) {
            const response = await api.get('/Venda', {
              signal: controller.signal,
              params: {
                Status: 'Concluida',
                Skip: skip,
                Take: PAGE_SIZE,
                CodigoCliente: client.codigoCliente,
              },
            });

            const items = response?.data?.items ?? [];
            result.push(
              ...items
                // Remove vendas de aluguel/locação/day use/mensalista e similares.
                .filter((i) => !isExcludedSale(i.descricao))
                .map((i) => ({
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

        // Nome dos planos Wellhub cujo primeiro registro de cada aluno é ignorado.
        const WELLHUB_PLANS = ['Wellhub - Beach Tennis', 'Wellhub - Futevôlei'];

        for (const client of teacherClients) {
          const clientSales = await fetchClientSales(client);

          // Marca o registro MAIS ANTIGO de CADA tipo de Wellhub (Beach Tennis
          // e Futevôlei) do aluno como isento: continua na lista, mas com valor 0.
          const oldestIndexByPlan = {};
          const oldestTimeByPlan = {};
          clientSales.forEach((s, index) => {
            const desc = (s.descricao || '').trim();
            if (!WELLHUB_PLANS.includes(desc)) return;
            const time = dayjs(s.data).valueOf();
            const t = Number.isNaN(time) ? Infinity : time;
            if (oldestTimeByPlan[desc] === undefined || t < oldestTimeByPlan[desc]) {
              oldestTimeByPlan[desc] = t;
              oldestIndexByPlan[desc] = index;
            }
          });

          const indexesToExempt = new Set(Object.values(oldestIndexByPlan));
          clientSales.forEach((s, index) => {
            if (indexesToExempt.has(index)) s.wellhubIsenta = true;
          });

          salesItems.push(...clientSales);
        }

        // Ignora o resultado se as dependências mudaram durante a busca.
        if (active) setSales(salesItems);
      } catch (err) {
        // Requisição cancelada (saída da página): silencioso, sem mexer no estado.
        if (controller.signal.aborted) return;
        console.error('Erro ao buscar vendas: ' + (err.message || 'Erro desconhecido'));
        if (active) setSales([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchSales();

    return () => {
      active = false;
      // Aborta qualquer requisição pendente.
      controller.abort();
    };
    // teacherClientsKey representa a identidade estável de teacherClients.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacherClientsKey]);

  // Agrupa vendas por cliente. Planos de vários meses (trimestral, semestral,
  // anual...) têm o valor dividido pela quantidade de meses e são replicados,
  // gerando uma venda por mês (competência avançando a partir da data original).
  const groupedByClient = useMemo(() => {
    const map = {};

    // Inicializa todos os alunos do professor (mesmo sem vendas)
    teacherClients.forEach((client) => {
      map[client.codigoCliente] = {
        clientId: client.codigoCliente,
        nome: client.nome,
        vendas: [],
      };
    });

    // Só inclui a venda se a competência (mês/ano da data) for o mês filtrado.
    const matchesMonth = (data) => {
      // Sem mês selecionado: exibe todas as datas.
      if (!selectedMonth) return true;
      const d = dayjs(data);
      return d.isValid() && d.isSame(selectedMonth, 'month');
    };

    const pushSale = (sale) => {
      if (!matchesMonth(sale.data)) return;
      if (!map[sale.clientId]) {
        map[sale.clientId] = {
          clientId: sale.clientId,
          nome: sale.clientNome,
          vendas: [],
        };
      }
      map[sale.clientId].vendas.push(sale);
    };

    // Cota Wellhub: as 8 primeiras (mais antigas) por aluno e por mês, contando
    // Beach Tennis e Futevôlei JUNTOS, recebem o valor ajustado; da 9ª em diante
    // mantêm o valor original. Aqui identificamos as vendas que excedem a cota.
    const WELLHUB_MONTHLY_LIMIT = 8;
    const wellhubExceededIds = new Set();
    const wellhubCounters = {};
    sales
      .filter((s) => {
        const d = (s.descricao || '').trim();
        // Ignora as isentas (primeiro de cada tipo): não ocupam a cota das 8.
        if (s.wellhubIsenta) return false;
        return d === 'Wellhub - Beach Tennis' || d === 'Wellhub - Futevôlei';
      })
      // Ordena por data crescente (mais antigas primeiro) para respeitar "as 8 primeiras".
      .sort((a, b) => dayjs(a.data).valueOf() - dayjs(b.data).valueOf())
      .forEach((s) => {
        const mes = dayjs(s.data).isValid() ? dayjs(s.data).format('YYYY-MM') : 'sem-data';
        // Chave por aluno + mês (sem o tipo): os dois Wellhub contam juntos.
        const key = `${s.clientId}|${mes}`;
        const count = wellhubCounters[key] ?? 0;
        wellhubCounters[key] = count + 1;
        if (count >= WELLHUB_MONTHLY_LIMIT) {
          wellhubExceededIds.add(s.id);
        }
      });

    // Cota TotalPass - Beach Tennis: as 3 primeiras (mais antigas) por aluno e
    // por mês recebem o valor ajustado; da 4ª em diante o valor é zerado.
    const TOTALPASS_MONTHLY_LIMIT = 12;
    const totalpassExceededIds = new Set();
    const totalpassCounters = {};
    sales
      .filter((s) => (s.descricao || '').trim() === 'TotalPass - Beach Tennis')
      .sort((a, b) => dayjs(a.data).valueOf() - dayjs(b.data).valueOf())
      .forEach((s) => {
        const mes = dayjs(s.data).isValid() ? dayjs(s.data).format('YYYY-MM') : 'sem-data';
        const key = `${s.clientId}|${mes}`;
        const count = totalpassCounters[key] ?? 0;
        totalpassCounters[key] = count + 1;
        if (count >= TOTALPASS_MONTHLY_LIMIT) {
          totalpassExceededIds.add(s.id);
        }
      });

    sales.forEach((sale) => {
      const desc = (sale.descricao || '').trim();

      // Ajuste de valor por descrição para planos de parceria.
      let baseValor = sale.valorTotal;
      if (desc === 'Wellhub - Beach Tennis') {
        baseValor = 23;
      } else if (desc === 'Wellhub - Futevôlei') {
        baseValor = 18;
      } else if (desc === 'TotalPass - Beach Tennis') {
        baseValor = 20.17;
      }

      // Wellhub que excede as 8 do mês/tipo/aluno mantém o valor original.
      if (wellhubExceededIds.has(sale.id)) {
        baseValor = sale.valorTotal;
      }

      // TotalPass - Beach Tennis que excede as 3 do mês/aluno tem valor zerado.
      if (totalpassExceededIds.has(sale.id)) {
        baseValor = 0;
      }

      // Primeiro Wellhub de cada tipo (o mais antigo do aluno): aparece com valor 0.
      if (sale.wellhubIsenta) {
        baseValor = 0;
      }

      const meses = getPeriodDivisor(desc);

      if (meses > 1 && baseValor != null) {
        // Rateia o valor e replica a venda para cada mês do plano.
        // Insere da parcela mais recente para a mais antiga (ordem inversa).
        const valorMes = baseValor / meses;
        const dataBase = dayjs(sale.data);
        for (let i = meses - 1; i >= 0; i -= 1) {
          const dataMes = dataBase.isValid() ? dataBase.add(i, 'month') : null;
          pushSale({
            ...sale,
            id: `${sale.id}-${i + 1}`,
            valorTotal: valorMes,
            data: dataMes ? dataMes.toISOString() : sale.data,
            competencia: dataMes ? dataMes.format('MM/YYYY') : null,
            parcela: `${i + 1}/${meses}`,
          });
        }
      } else {
        pushSale({ ...sale, valorTotal: baseValor });
      }
    });

    // Verdadeiro quando a descrição contém "GYMPASS" ou "TOTALPASS" (em
    // maiúsculo). Em minúsculo é outro tipo de venda e não conta aqui.
    const isPassOnly = (sale) => {
      const desc = sale.descricao || '';
      return desc.includes('GYMPASS') || desc.includes('TOTALPASS');
    };

    return Object.values(map)
      // Com mês selecionado: se TODAS as vendas do mês forem GYMPASS/TOTALPASS,
      // oculta o aluno; havendo qualquer outra venda no mês, ele aparece.
      .filter((group) => {
        if (!selectedMonth || group.vendas.length === 0) return true;
        return group.vendas.some((sale) => !isPassOnly(sale));
      })
      // Filtro "Com vendas": oculta alunos sem venda no mês. "Todos" mantém.
      .filter((group) => (onlyWithSales ? group.vendas.length > 0 : true))
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
  }, [sales, teacherClients, selectedMonth, onlyWithSales]);

  const totalAlunos = groupedByClient.length;
  const totalGeral = groupedByClient.reduce((sum, g) => sum + (g.totalValor || 0), 0);
  const totalRepasse = calcRepasse(totalGeral, percentValue);
  // Repasse líquido: repasse do mês menos o desconto informado (local).
  const totalRepasseLiquido = (totalRepasse ?? 0) - (desconto ?? 0);

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
        <Space align="center" size="small" wrap>
          <Segmented
            value={onlyWithSales ? 'comVendas' : 'todos'}
            onChange={(val) => setOnlyWithSales(val === 'comVendas')}
            disabled={loading}
            options={[
              { label: 'Com vendas', value: 'comVendas' },
              { label: 'Todos', value: 'todos' },
            ]}
          />
          <DatePicker
            picker="month"
            value={selectedMonth}
            onChange={(date) => setSelectedMonth(date || null)}
            format="MMMM/YYYY"
            allowClear={false}
            placeholder="Todas as datas"
            disabled={loading}
            disabledDate={(current) => current && current.isAfter(dayjs(), 'month')}
            style={{ width: 170 }}
          />
        </Space>
      </div>

      <Row gutter={[16, 16]} align="stretch" style={{ marginTop: 16 }}>
        <Col xs={8} lg={4}>
          <Card size="small" style={{ height: '100%' }}>
            <Statistic title="Alunos" value={totalAlunos} />
          </Card>
        </Col>
        <Col xs={16} sm={10} lg={6}>
          <Card size="small" style={{ height: '100%' }}>
            <Statistic title="Total em vendas" value={totalGeral} precision={2} prefix="R$" />
          </Card>
        </Col>
        <Col xs={24} sm={10} lg={6}>
          <Card size="small" style={{ height: '100%' }}>
            <Statistic
              title={desconto ? 'Repasse (c/ desconto)' : 'Repasse'}
              value={totalRepasseLiquido}
              precision={2}
              prefix="R$"
            />
          </Card>
        </Col>
        <Col xs={24} sm={24} lg={8}>
          <Card size="small" style={{ height: '100%' }}>
            <Space size="large" align="start" wrap>
              <div>
                <Text
                  type="secondary"
                  style={{ display: 'block', fontSize: 14, marginBottom: 4 }}
                >
                  Repasse (%)
                </Text>
                <Space align="center" size="small">
                  <InputNumber
                    value={percentValue}
                    onChange={setPercentValue}
                    disabled={!editingPercent || !teacher || loading}
                    controls={false}
                    min={0}
                    max={100}
                    precision={0}
                    suffix="%"
                    placeholder="—"
                    style={{ width: 90 }}
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
                        disabled={!teacher || loading}
                        onClick={() => setEditingPercent(true)}
                      />
                    </Tooltip>
                  )}
                </Space>
              </div>

              <div>
                <Text
                  type="secondary"
                  style={{ display: 'block', fontSize: 14, marginBottom: 4 }}
                >
                  Desconto
                </Text>
                <InputNumber
                  value={desconto}
                  onChange={setDesconto}
                  disabled={loading}
                  min={0}
                  precision={2}
                  decimalSeparator=","
                  prefix="R$"
                  placeholder="0,00"
                  controls={false}
                  style={{ width: 120 }}
                />
              </div>
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
        scroll={{ x: 'max-content' }}
        style={{ marginTop: 16 }}
        expandable={{
          expandedRowRender: (record) => (
            <div style={{ background: colorFillAlter, padding: 8, borderRadius: 6 }}>
              <Table
                dataSource={record.vendas}
                columns={salesColumns}
                rowKey="id"
                pagination={false}
                size="small"
                scroll={{ x: 'max-content' }}
              />
            </div>
          ),
        }}
      />
    </div>
  );
}

export default TeacherSales;
