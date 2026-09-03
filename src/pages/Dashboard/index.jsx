import { Typography } from 'antd';
import { useAuth } from '../../contexts/AuthContext';
import useCustomerContract from '../../hooks/useCustomerContract';
import useClients from '../../hooks/useClients';
import { useSync } from '../../contexts/SyncContext';

const { Title, Paragraph } = Typography;

function Dashboard() {
  const { user } = useAuth();
  const { data } = useClients({
    params: {
      id: 22338120,
    },
  });
  const { allClients } = useSync();
  // console.log(
  //   'allClients',
  //   allClients,
  //   // allClients.filter((c) => c?.codigoCliente === 25864775),
  // );

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
