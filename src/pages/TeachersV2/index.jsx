import { Typography, Button, Space, Modal, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import ResponsiveTable from '../../components/ResponsiveTable';
import {
  EyeOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { PATHS, teacherSalesV2Path, teacherEditV2Path } from '../../routes/paths';
import useTeachers from './useTeachers';

const { Title } = Typography;

function TeachersV2() {
  const { data, loading, refetch, deleteTeacher } = useTeachers();

  console.log('TeachersV2 data:', data);

  const navigate = useNavigate();

  const handleDelete = (teacher) => {
    Modal.confirm({
      title: 'Excluir professor',
      icon: <ExclamationCircleOutlined />,
      content: `Tem certeza que deseja excluir "${teacher.nome}"? Esta ação não pode ser desfeita.`,
      okText: 'Excluir',
      okButtonProps: { danger: true },
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await deleteTeacher(teacher._id);
          message.success('Professor excluído com sucesso!');
          refetch();
        } catch (err) {
          message.error('Erro ao excluir: ' + (err.message || 'Erro desconhecido'));
        }
      },
    });
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'idNextFit',
      key: 'idNextFit',
      width: 120,
    },
    { title: 'Nome', dataIndex: 'nome', key: 'nome' },
    {
      title: 'Ações',
      fixed: 'end',
      align: 'center',
      width: 160,
      render: (_, record) => (
        <Space size="middle">
          <Link title="Ver vendas" to={teacherSalesV2Path(record.idNextFit)}>
            <EyeOutlined />
          </Link>
          <a title="Editar" onClick={() => navigate(teacherEditV2Path(record.idNextFit))}>
            <EditOutlined />
          </a>
          <a title="Excluir" onClick={() => handleDelete(record)} style={{ color: '#ff4d4f' }}>
            <DeleteOutlined />
          </a>
        </Space>
      ),
    },
  ];

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
          Professores v2
        </Title>
        <Link to={PATHS.teacherNewV2}>
          <Button type="primary" icon={<PlusOutlined />}>
            Novo Professor
          </Button>
        </Link>
      </div>
      <ResponsiveTable
        dataSource={data || []}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={false}
        scroll={{ x: 'max-content' }}
        style={{ marginTop: 16 }}
      />
    </div>
  );
}

export default TeachersV2;
