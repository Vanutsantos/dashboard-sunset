import { Typography, Row, Col, Card, Statistic } from 'antd';
import {
  TeamOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
} from '@ant-design/icons';

const { Title } = Typography;

const stats = [
  { title: 'Clientes Ativos', value: 128, icon: <TeamOutlined />, color: '#1890ff' },
  { title: 'Professores', value: 12, icon: <UserOutlined />, color: '#52c41a' },
  { title: 'Vendas do Mês', value: 45, icon: <ShoppingCartOutlined />, color: '#faad14' },
  { title: 'Receita Mensal', value: 'R$ 32.500', icon: <DollarOutlined />, color: '#722ed1' },
];

function Dashboard() {
  return (
    <div>
      <Title level={4}>Dashboard</Title>
      <Row gutter={[16, 16]}>
        {stats.map((stat) => (
          <Col xs={24} sm={12} lg={6} key={stat.title}>
            <Card>
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.icon}
                valueStyle={{ color: stat.color }}
              />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}

export default Dashboard;
