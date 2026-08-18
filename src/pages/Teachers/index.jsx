import { Typography, Table, Button } from 'antd';
import { Link } from 'react-router-dom';
import { EyeOutlined, PlusOutlined } from '@ant-design/icons';
import useTeachers from '../../hooks/useTeachers';

const { Title } = Typography;

const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 100,
  },
  { title: 'Nome', dataIndex: 'nome', key: 'nome' },
  {
    title: 'Ações',
    fixed: 'end',
    align: 'center',
    width: 100,
    render: (_, record) => (
      <Link title="Ver" to={`/teacher-sales/${record.id}`}>
        <EyeOutlined />
      </Link>
    ),
  },
];

function Teachers() {
  const { data, loading } = useTeachers();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={4} style={{ margin: 0 }}>
          Professores
        </Title>
        <Link to="/teachers/new">
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
        style={{ marginTop: 16 }}
      />
    </div>
  );
}

export default Teachers;
