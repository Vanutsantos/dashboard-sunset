import { Button, Tooltip } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { formatarMoeda } from './utils';

/** Coluna de numeração sequencial. */
function indexColumn() {
    return {
        title: '#',
        key: 'index',
        width: 60,
        align: 'center',
        render: (_, __, index) => index + 1,
    };
}

/** Colunas da tabela principal (alunos do professor). */
export const clientColumns = [
    indexColumn(),
    { title: 'ID', dataIndex: 'clientId', key: 'clientId', width: 100 },
    {
        title: 'Nome',
        dataIndex: 'nome',
        key: 'nome',
        render: (nome) => (nome || '').toUpperCase(),
    },
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
        render: formatarMoeda,
    },
];

/** Colunas da sub-tabela de vendas de um aluno. */
export const salesColumns = [
    indexColumn(),
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
    {
        title: 'Valor',
        dataIndex: 'valorTotal',
        key: 'valorTotal',
        width: 120,
        render: formatarMoeda,
    },
    {
        title: 'Data',
        dataIndex: 'data',
        key: 'data',
        width: 120,
        render: (val) => (val ? dayjs(val).format('DD/MM/YYYY') : '-'),
    },
];

/**
 * Colunas da sub-tabela de vendas avulsas: as mesmas de vendas, mais a ação
 * de excluir a venda.
 */
export function buildAvulsasColumns(onDelete) {
    return [
        ...salesColumns,
        {
            title: 'Ações',
            key: 'acoes',
            width: 80,
            align: 'center',
            render: (_, record) => (
                <Tooltip title="Excluir">
                    <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => onDelete(record)}
                    />
                </Tooltip>
            ),
        },
    ];
}
