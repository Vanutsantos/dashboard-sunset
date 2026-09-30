import {
  Button,
  DatePicker,
  Form,
  Input,
  Modal,
  Space,
  Typography,
  message,
  theme,
} from 'antd';
import { useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  ExclamationCircleOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import apiSunset from '../../services/apiSunset';
import ResponsiveTable from '../../components/ResponsiveTable';
import { buildAvulsasColumns, clientColumns, salesColumns } from './columns';
import ResumoCards from './ResumoCards';
import SaleModal from './SaleModal';
import useTeacherSales from './useTeacherSales';
import { calcRepasse, gerarIdCurto, normalizarTexto } from './utils';

const { Title } = Typography;

function TeacherSalesV2() {
  const { token: { colorFillAlter } } = theme.useToken();
  const { id } = useParams();
  const [saleForm] = Form.useForm();

  // Dados do professor e das vendas do mês (com controle de loading/cancelamento).
  const { selectedMonth, setSelectedMonth, teacher, groups, total, loading, refetch } =
    useTeacherSales(id);

  const [desconto, setDesconto] = useState(null);
  const [saleModalOpen, setSaleModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  // Repasse (%): null = modo leitura; número = valor local sendo editado.
  const [porcentagemInput, setPorcentagemInput] = useState(null);

  // O valor exibido vem do professor; só a edição em andamento tem valor próprio.
  const porcentagem = useMemo(
    () => ({
      isEditing: porcentagemInput !== null,
      value: porcentagemInput ?? teacher?.porcentagem ?? 0,
    }),
    [porcentagemInput, teacher?.porcentagem],
  );

  const handleDeleteSale = useCallback(
    (sale) => {
      Modal.confirm({
        title: 'Excluir venda avulsa',
        icon: <ExclamationCircleOutlined />,
        content: `Tem certeza que deseja excluir "${sale.descricao || 'esta venda'}"? Esta ação não pode ser desfeita.`,
        okText: 'Excluir',
        okButtonProps: { danger: true },
        cancelText: 'Cancelar',
        onOk: async () => {
          try {
            await apiSunset.delete(`/teacher-sales/${sale._id}`);
            await refetch();
            message.success('Venda excluída com sucesso!');
          } catch (err) {
            message.error('Erro ao excluir venda: ' + (err.message || 'Erro desconhecido'));
          }
        },
      });
    },
    [refetch],
  );

  const handleSaveSale = async () => {
    try {
      const values = await saleForm.validateFields();

      await apiSunset.post('/teacher-sales', {
        id: await gerarIdCurto(`${id}-${Date.now()}`),
        nomeCliente: 'Vendas Avulsas',
        nomeProfessor: teacher?.nome ?? '',
        codigoProfessor: String(id),
        descricao: `${values.nomeAluno} - ${values.descricao}`,
        valorTotal: values.valor ?? 0,
        codigoCliente: 0,
        data: values.data ? values.data.format('YYYY-MM-DDTHH:mm:ss.SSSZ') : null,
        parcela: null,
        noClient: true,
      });

      message.success('Venda cadastrada com sucesso!');
      saleForm.resetFields();
      setSaleModalOpen(false);
      await refetch();
    } catch (err) {
      // Erros de validação do form não têm .message de API; ignora esses.
      if (err?.errorFields) return;
      message.error('Erro ao cadastrar venda: ' + (err.message || 'Erro desconhecido'));
    }
  };

  const handlePorcentagemToggle = async () => {
    // Modo leitura -> edição: parte do valor atual do professor.
    if (porcentagemInput === null) {
      setPorcentagemInput(teacher?.porcentagem || 0);
      return;
    }

    try {
      await apiSunset.put(`/teachers/${id}`, { porcentagem: porcentagemInput });
      message.success('Porcentagem atualizada com sucesso!');
      setPorcentagemInput(null);
      await refetch();
    } catch (err) {
      message.error('Erro ao atualizar porcentagem: ' + (err.message || 'Erro desconhecido'));
    }
  };

  const totalRepasseLiquido = useMemo(() => {
    const bruto = calcRepasse(total, teacher?.porcentagem ?? 0) ?? 0;
    return bruto - (desconto ?? 0);
  }, [total, teacher?.porcentagem, desconto]);

  const avulsasColumns = useMemo(
    () => buildAvulsasColumns(handleDeleteSale),
    [handleDeleteSale],
  );

  // Filtro local por nome do aluno (não altera os totais exibidos).
  const displayedGroups = useMemo(() => {
    const termo = normalizarTexto(search).trim();
    if (!termo) return groups;
    return groups.filter((group) => normalizarTexto(group.nome).includes(termo));
  }, [groups, search]);

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
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Buscar por nome"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={loading}
            style={{ width: 200 }}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            disabled={loading}
            onClick={() => setSaleModalOpen(true)}
          >
            Nova venda
          </Button>
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

      <ResumoCards
        totalAlunos={groups.length}
        totalVendas={total}
        totalRepasseLiquido={totalRepasseLiquido}
        desconto={desconto}
        onDescontoChange={setDesconto}
        loading={loading}
        porcentagem={porcentagem}
        onPorcentagemChange={(value) => setPorcentagemInput(Number(value))}
        onPorcentagemToggle={handlePorcentagemToggle}
      />

      <ResponsiveTable
        dataSource={displayedGroups}
        columns={clientColumns}
        rowKey="clientId"
        loading={loading}
        pagination={false}
        scroll={{ x: 'max-content' }}
        style={{ marginTop: 16 }}
        expandable={{
          expandedRowRender: (record) => (
            <div style={{ background: colorFillAlter, padding: 8, borderRadius: 6 }}>
              <ResponsiveTable
                dataSource={record.vendas}
                columns={record.clientId === 0 ? avulsasColumns : salesColumns}
                rowKey="id"
                pagination={false}
                size="small"
                scroll={{ x: 'max-content' }}
              />
            </div>
          ),
        }}
      />

      <SaleModal
        open={saleModalOpen}
        form={saleForm}
        onCancel={() => setSaleModalOpen(false)}
        onOk={handleSaveSale}
      />
    </div>
  );
}

export default TeacherSalesV2;
