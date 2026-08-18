import { Typography } from 'antd';
import { useAuth } from '../../contexts/AuthContext';

const { Title, Paragraph } = Typography;

function Dashboard() {
  const { user } = useAuth();

  return (
    <div>
      <Title level={3}>Bem-vindo ao Dashboard Sunset</Title>
      <Paragraph type="secondary" style={{ fontSize: 16 }}>
        Olá, {user?.displayName || user?.email}! Use o menu lateral para navegar entre as páginas.
      </Paragraph>
    </div>
  );
}

export default Dashboard;
