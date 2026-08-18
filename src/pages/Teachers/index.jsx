import { Typography, Table } from 'antd';
import { Link } from 'react-router-dom';
import { EyeOutlined } from '@ant-design/icons';
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
      <Title level={4}>Professores</Title>
      <Table
        dataSource={data || []}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={false}
      />
    </div>
  );
}

export default Teachers;
