import { Typography, Table, Button, Space, Modal, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import {
  EyeOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import useTeachers from '../../hooks/useTeachers';
import useTeacherMutations from '../../hooks/useTeacherMutations';
import { PATHS, teacherSalesPath, teacherEditPath } from '../../routes/paths';

const { Title } = Typography;

function Teachers() {
  const { data, loading, refetch } = useTeachers();
  const { deleteTeacher } = useTeacherMutations();
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
          await deleteTeacher(teacher.id);
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
      dataIndex: 'id',
      key: 'id',
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
          <Link title="Ver vendas" to={teacherSalesPath(record.id)}>
            <EyeOutlined />
          </Link>
          <a title="Editar" onClick={() => navigate(teacherEditPath(record.id))}>
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
          Professores
        </Title>
        <Link to={PATHS.teacherNew}>
          <Button type="primary" icon={<PlusOutlined />}>
            Novo Professor
          </Button>
        </Link>
      </div>
      <Table
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

export default Teachers;
